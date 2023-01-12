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
  handleArrowUpKeyPress(event) {
    this._guardEventDelegation(event)
    event.stopPropagation()

    const table = this.table.body
    const selectedCell = this.table.selectedCell
    const inputField = selectedCell.querySelector("." + CSS.inputField)
    const caretPosition = getCaretCharacterOffsetWithin(inputField)

    if (selectedCell.parentNode.rowIndex === 0) {
      const currentBlockIndex = this.api.blocks.getCurrentBlockIndex()

      if (currentBlockIndex > 0) {
        this.api.caret.setToBlock("start", currentBlockIndex - 1)
      }

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

    if (selectedCell.parentNode.rowIndex === table.rows.length - 1) {
      const currentBlockIndex = this.api.blocks.getCurrentBlockIndex()
      const lastBlockIndex = this.api.blocks.getBlocksCount() - 1

      if (currentBlockIndex === lastBlockIndex) {
        this.api.caret.setToBlock("start", currentBlockIndex + 1)
      }

      return
    }

    if (caretPosition === inputField.textContent.length) {
      const belowCell =
        table.rows[selectedCell.parentNode.rowIndex + 1].cells[selectedCell.cellIndex]
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
