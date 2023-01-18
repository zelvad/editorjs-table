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
    this._guardEventDelegation(event)
    event.stopPropagation()

    document.execCommand("insertLineBreak")
    event.preventDefault()
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleTabKeyPress(event) {
    this._guardEventDelegation(event)
    event.stopPropagation()
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  handleShiftTabKeyPress(event) {
    this._guardEventDelegation(event)
    event.stopPropagation()
    event.preventDefault()

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
    this._guardEventDelegation(event)
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
    this._guardEventDelegation(event)
    event.stopPropagation()

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
   * @private
   * @param {KeyboardEvent} event
   */
  _guardEventDelegation(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return
    }
  }
}
