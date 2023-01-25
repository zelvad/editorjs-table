import { getCaretCharacterOffsetWithin } from "./documentUtils"
import { CSS } from "./table"

export class Shortcuts {
  constructor(table, api) {
    this.table = table
    this.api = api
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleEnterKeyPress(event) {
    event.stopPropagation()

    if (this._isComposingKorean(event)) return

    document.execCommand("insertLineBreak")
    event.preventDefault()
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleTabKeyPress(event) {
    event.stopPropagation()
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleShiftTabKeyPress(event) {
    event.stopPropagation()
    event.preventDefault()

    if (this._isComposingKorean(event)) return

    const table = this.table.body
    const selectedCell = this.table.selectedCell
    const isFirstCell = selectedCell.parentNode.rowIndex === 0 && selectedCell.cellIndex === 0
    const isAtLeftEnd = selectedCell.cellIndex === 0
    const leftCell = table.rows[selectedCell.parentNode.rowIndex].cells[selectedCell.cellIndex - 1]

    if (isFirstCell) {
      this.api.caret.setToPreviousBlock("end", 0)
      return
    }

    if (isAtLeftEnd) {
      const upperRowLastCell =
        table.rows[selectedCell.parentNode.rowIndex - 1].cells[table.rows[0].cells.length - 1]

      upperRowLastCell.querySelector("." + CSS.inputField).focus()
      return
    }

    if (leftCell.style.display === "none") {
      const mainMergedCell = this.table.searchMainMergedCell(leftCell)
      const mainMergedCellInput = mainMergedCell.querySelector("." + CSS.inputField)

      mainMergedCellInput.focus()
      return
    }

    leftCell.querySelector("." + CSS.inputField).focus()
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleArrowUpKeyPress(event) {
    event.stopPropagation()

    const table = this.table.body
    const selectedCell = this.table.selectedCell
    const inputField = selectedCell.querySelector("." + CSS.inputField)
    const caretPosition = getCaretCharacterOffsetWithin(inputField)

    if (selectedCell.parentNode.rowIndex === 0) {
      this.api.caret.setToPreviousBlock("end", 0)
      return
    }

    if (caretPosition === 0) {
      const upperCell =
        table.rows[selectedCell.parentNode.rowIndex - 1].cells[selectedCell.cellIndex]
      const upperCellInput = upperCell.querySelector("." + CSS.inputField)

      if (upperCell.style.display === "none") {
        const mainMergedCell = this.table.searchMainMergedCell(upperCell)
        const mainMergedCellInput = mainMergedCell.querySelector("." + CSS.inputField)

        mainMergedCellInput.focus()
      }

      if (!upperCell.style.getPropertyValue("display")) {
        upperCellInput.focus()
      }
    }
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleArrowDownKeyPress(event) {
    event.stopPropagation()

    if (this._isComposingKorean(event)) return

    const table = this.table.body
    const selectedCell = this.table.selectedCell
    const inputField = selectedCell.querySelector("." + CSS.inputField)
    const caretPosition = getCaretCharacterOffsetWithin(inputField)
    const isCurrentCellAtBottom =
      selectedCell.parentNode.rowIndex + selectedCell.rowSpan - 1 === table.rows.length - 1

    if (isCurrentCellAtBottom) {
      this.api.caret.setToNextBlock("start", 0)
      return
    }

    if (caretPosition === inputField.textContent.length) {
      const belowCell =
        table.rows[selectedCell.parentNode.rowIndex + selectedCell.rowSpan].cells[
          selectedCell.cellIndex
        ]
      const belowCellInput = belowCell.querySelector("." + CSS.inputField)

      if (belowCell.style.display === "none") {
        const mainMergedCell = this.table.searchMainMergedCell(belowCell)
        const mainMergedCellInput = mainMergedCell.querySelector("." + CSS.inputField)

        mainMergedCellInput.focus()
      } else {
        belowCellInput.focus()
      }
    }
  }

  /**
   * 한글을 입력중일때 커서를 옮기면 다음 셀에 입력하고 있던 글자가 복사되는 버그를 해결합니다.
   * https://velog.io/@corinthionia/JS-keydown에서-한글-입력-시-마지막-음절이-중복-입력되는-경우-함수가-두-번-실행되는-경우
   *
   * @private
   * @param {KeyboardEvent} event
   */
  _isComposingKorean(event) {
    return event.isComposing
  }
}
