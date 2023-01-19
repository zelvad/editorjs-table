import { create } from "./documentUtils"
import { CSS as TableCSS } from "./table"
import lineRemove from "./img/line-remove.svg"

export const CSS = {
  selectLineCol: "tc-table__select_line_col",
  selectLineRow: "tc-table__select_line_row",
  trRemove: "tc-table__tr_remove",
  tdRemove: "tc-table__td_remove",
  removeButton: "tc-table__select_line_remover",
  selected: "tc-table__select_line__selected",
}

export class SelectLine {
  constructor(table) {
    /**
     * @private
     */
    this.table = table

    this.removeButton = this._createLineRemoveButton()
  }

  /**
   * 첫 번째 행,열에 Select Line 을 생성합니다.
   *
   * @param {HTMLTableCellElement} cell
   * @param {Number} direction
   */
  createElem(cell, direction = 0) {
    const className = direction === 0 ? CSS.selectLineCol : CSS.selectLineRow

    if (!cell.querySelector(`.${className}`)) {
      const elem = create("div", [className])
      elem.addEventListener("click", this._onClick, false)
      elem.addEventListener("mouseenter", this._onMouseEnter, false)
      elem.addEventListener("mouseleave", this._onMouseLeave, false)
      cell.appendChild(elem)
    }
  }

  /**
   *
   * @param {Number[]} colIndexes
   */
  highlightColSelectLines(colIndexes) {
    const colSelectLines = Array.from(this.table.body.rows[0].cells)
      .filter((cell) => colIndexes.includes(cell.cellIndex))
      .map((cell) => cell.querySelector("." + CSS.selectLineCol))

    colSelectLines.forEach((button) => {
      button.classList.add(CSS.selected)
    })

    this._placeLineRemoveButton("horizontal")
  }

  /**
   *
   * @param {Number[]} rowIndexes
   */
  highlightRowSelectLines(rowIndexes) {
    const rowSelectLines = Array.from(this.table.body.rows)
      .filter((row) => rowIndexes.includes(row.rowIndex))
      .map((row) => row.querySelector("." + CSS.selectLineRow))

    rowSelectLines.forEach((button) => {
      button.classList.add(CSS.selected)
    })

    this._placeLineRemoveButton("vertical")
  }

  dehighlightSelectLines() {
    const selectLines = this.table.body.querySelectorAll(
      `.${CSS.selectLineCol},.${CSS.selectLineRow}`
    )

    selectLines.forEach((line) => {
      line.classList.remove(CSS.selected)
    })
  }

  hideLineRemoveButton() {
    this.removeButton.style.visibility = "hidden"
  }

  /**
   * 선택된 줄의 첫 번째 셀을 포커스 합니다.
   *
   * @private
   * @param {Number} direction
   * @param {Number} index
   * @returns
   */
  _focusFirstSelecedCell(direction, index) {
    if (direction === 0) {
      this.table.body.rows[0].cells[index].querySelector("." + TableCSS.inputField).focus()
      return
    }

    this.table.body.rows[index].cells[0].querySelector("." + TableCSS.inputField).focus()
  }

  /**
   *
   * @private
   */
  _createLineRemoveButton() {
    const lineRemoveButton = create("button", [CSS.removeButton])
    const iconContainer = create("div")

    const removeSelectedLines = (event) => {
      const button = event.target.closest("." + CSS.removeButton)
      const direction = button.dataset.direction

      if (direction === "horizontal") {
        const selectedCols = this.table.selectedCols

        selectedCols.forEach((col, i) => {
          this.table.removeColumn(col - i)
        })

        this.table.deselectCells()
        return
      }

      if (direction === "vertical") {
        const selectedRows = this.table.selectedRows

        selectedRows.forEach((row, i) => {
          this.table.removeRow(row - i)
        })

        this.table.deselectCells()
        return
      }
    }

    iconContainer.innerHTML = lineRemove

    lineRemoveButton.appendChild(iconContainer)
    lineRemoveButton.addEventListener("click", removeSelectedLines.bind(this))
    this.table.body.appendChild(lineRemoveButton)

    return lineRemoveButton
  }

  /**
   * 조건에 따라 삭제 버튼의 위치를 조정합니다.
   *
   * @private
   * @param {String} direction
   */
  _placeLineRemoveButton(direction) {
    const BORDER_WIDTH = 2
    const isEveryCellSelected =
      this.table.selectedCols.length === this.table.body.rows[0].cells.length &&
      this.table.selectedRows.length === this.table.body.rows.length

    if (isEveryCellSelected) {
      this.hideLineRemoveButton()
      return
    }

    if (direction === "horizontal") {
      const selectedLines = Array.from(this.table.body.rows[0].querySelectorAll("." + CSS.selected))
      const startX = selectedLines[0].offsetParent.offsetLeft
      const totalWidth = selectedLines.reduce(
        (initialValue, line) => line.offsetWidth + BORDER_WIDTH + initialValue,
        0
      )

      this.removeButton.style.left = `${startX + totalWidth / 2}px`
      this.removeButton.style.top = "-40px"
      this.removeButton.style.transform = "translateX(-50%)"
      this.removeButton.style.visibility = "visible"
      this.removeButton.setAttribute("data-direction", direction)

      return
    }

    if (direction === "vertical") {
      const rows = Array.from(this.table.body.rows)
      const selectedLines = []

      rows.forEach((row) => {
        const selectedLine = row.cells[0].querySelector("." + CSS.selected)
        if (selectedLine) {
          selectedLines.push(selectedLine)
        }
      })

      const startY = selectedLines[0].offsetParent.offsetTop
      const totalHeight = selectedLines.reduce(
        (initialValue, line) => line.offsetHeight + BORDER_WIDTH + initialValue,
        0
      )

      this.removeButton.style.top = `${startY + totalHeight / 2}px`
      this.removeButton.style.left = "-40px"
      this.removeButton.style.transform = "translateY(-50%)"
      this.removeButton.style.visibility = "visible"
      this.removeButton.setAttribute("data-direction", direction)
    }
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  _getDirection = (e) => {
    if (e.target.classList.contains(CSS.selectLineCol)) return 0
    return 1
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  _onMouseEnter = (e) => {
    // 가로 줄
    if (this._getDirection(e) === 0) {
      const index = this._getIndex(e)

      for (let i = 0; i < this.table.body.rows.length; i += 1) {
        if (this.table.body.rows[i].children[index]) {
          this.table.body.rows[i].children[index].classList.add(CSS.tdRemove)
        }
      }

      return
    }

    const tr = e.target.closest("tr")

    Array.from(tr.cells).forEach((cell) => {
      cell.classList.add(CSS.trRemove)
    })
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  _onMouseLeave = (e) => {
    if (e.target) {
      if (this._getDirection(e) === 0) {
        const tds = this.table.body.querySelectorAll(`.${CSS.tdRemove}`)
        tds.forEach((td) => {
          td.classList.remove(CSS.tdRemove)
        })
      } else {
        const tr = e.target.closest("tr")
        Array.from(tr.cells).forEach((cell) => {
          cell.classList.remove(CSS.trRemove)
        })
      }
    }
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  _getIndex = (e) => {
    const isHorizontal = e.target.classList.contains(CSS.selectLineCol)
    const index = isHorizontal
      ? e.target.offsetParent.cellIndex
      : e.target.offsetParent.parentNode.rowIndex

    return index
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  _onClick = (e) => {
    const index = this._getIndex(e)
    const direction = this._getDirection(e)

    this.table.deselectCells()

    if (direction === 0) {
      this.table.selectColumn(index)
      this.highlightColSelectLines([index])
      this._focusFirstSelecedCell(direction, index)
      this.table.selectedCols = [index]
      this.table.selectedRows = Array.from({ length: this.table.body.rows.length }, (_v, i) => i)
    } else {
      this.table.selectRow(index)
      this.highlightRowSelectLines([index])
      this._focusFirstSelecedCell(direction, index)
      this.table.selectedRows = [index]
      this.table.selectedCols = Array.from(
        { length: this.table.body.rows[0].cells.length },
        (_v, i) => i
      )
    }
  }
}
