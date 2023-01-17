import {
  create,
  getCoords,
  getSideByCoords,
  turnTdIntoTh,
  turnThIntoTd,
  hideCell,
  showHiddenCell,
} from "./documentUtils"
import { Resize } from "./resize"
import { SelectLine, CSS as CSSSelectLine } from "./selectLine"
import { CreateLine } from "./createLine"
import { ImageUpload, CSS as imageUploadCSS } from "./imageUpload"
import "./styles/table.scss"
import { CellMenu, CSS as CellMenuCSS } from "./cellMenu"
import { Shortcuts } from "./shortcuts"

export const CSS = {
  table: "tc-table",
  inputField: "tc-table__inp",
  cell: "tc-table__cell",
  container: "tc-table__container",
  containerReadOnly: "tc-table__container_readonly",
  wrapper: "tc-table__wrap",
  area: "tc-table__area",
  addColumn: "tc-table__add_column",
  addRow: "tc-table__add_row",
  addColumnButton: "tc-table__add_column_button",
  addRowButton: "tc-table__add_row_button",
}

/**
 * Generates and manages _table contents.
 */
export class Table {
  /**
   * Creates
   *
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(config, api, readOnly) {
    this.api = api
    this.readOnly = readOnly
    this._numberOfColumns = 0
    this._numberOfRows = 0

    this._element = this._createTableWrapper()
    this._table = this._element.querySelector("table")
    this.colgroup = this._table.querySelector("colgroup")
    this.selectedRows = []
    this.selectedCols = []
    this.isRowHeaderOn = false
    this.isColHeaderOn = false

    this.resize = new Resize(this)
    this.selectLine = new SelectLine(this)
    this.createLine = new CreateLine(this)
    this.imageUpload = new ImageUpload(this)
    this.cellMenu = new CellMenu(this, config, api)
    this.shortcuts = new Shortcuts(this, api)

    if (!this.readOnly) {
      this._hangEvents()
    }
  }

  deselectCells() {
    const everyCell = this._table.querySelectorAll("td,th")
    everyCell.forEach((cell) => {
      cell.classList.remove("selected")
    })
  }

  fillButtons = (cell, x, y) => {
    if (this.readOnly) return

    // column
    if (y === 0) {
      // this.createLine.createElem(cell)
    }

    if (x !== 0) {
      // 여기서 너비조절 막대기 생성하는 중.
      this.resize.createElem(cell)
    }

    // select line button
    if (x === 0 || y === 0) {
      this.selectLine.createElem(cell, Number(x === 0))
      if (x === 0 && y === 0) {
        this.selectLine.createElem(cell)
      }
    }

    // row
    if (x === 0) {
      // this.createLine.createElem(cell, 1)
    }
  }

  updateButtons = () => {
    for (let i = 0; i < this._table.rows.length; i += 1) {
      const row = this._table.rows[i]

      for (let r = 0; r < row.children.length; r += 1) {
        const cell = row.children[r]
        this.fillButtons(cell, r, i)
      }
    }
  }

  removeButtons = (direction = 0) => {
    const arr = [
      [CSS.addColumn, CSSSelectLine.selectLineCol],
      [CSS.addRow, CSSSelectLine.selectLineRow],
    ]
    arr[direction].forEach((className) => {
      const elem1 = this._table.querySelectorAll(`.${className}`)
      for (let i = 0; i < elem1.length; i += 1) {
        elem1[i].remove()
      }
    })
  }

  insertCol(index) {
    const col = create("col", [], { span: 1 })

    this.colgroup.insertBefore(col, this.colgroup.children[index])
  }

  removeCol(index) {
    this.body.querySelector("colgroup").children[index].remove()
  }

  drawTableFromData(data) {
    const table = this._table
    const { rows, colgroup } = data

    rows.forEach((row, i) => {
      const newRow = table.insertRow(i)
      const isFirstRow = i === 0
      const isSecondRow = i === 1

      if (isFirstRow) {
        this.removeButtons(0)
      }
      if (isFirstRow && row[1].isHeader) {
        this.isRowHeaderOn = true
      }
      if (isSecondRow && row[0].isHeader) {
        this.isColHeaderOn = true
      }

      row.forEach(({ text, bgColor, colspan, rowspan, display, isHeader }, i) => {
        const newCell = newRow.insertCell(i)

        this._fillCell(newCell)

        newCell.colSpan = colspan
        newCell.rowSpan = rowspan
        newCell.style.backgroundColor = bgColor
        newCell.querySelector("." + CSS.inputField).innerHTML = text

        if (isHeader) {
          turnTdIntoTh(newCell)
        }
        if (display === false) {
          newCell.style.display = "none"
          newCell.querySelector("." + CSS.inputField).contentEditable = false
        }
      })

      this._numberOfRows++
      this.updateButtons()
    })

    colgroup.forEach(({ span, width }, i) => {
      if (i === 0) {
        this.removeButtons(1)
      }

      this._numberOfColumns++
      this.insertCol(i)
      this.updateButtons()

      this.colgroup.children[i].style.width = width
      this.colgroup.children[i].span = span
    })
  }

  /**
   * Add column in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  addColumn(index = -1) {
    this._numberOfColumns++
    /** Add cell in each row */
    const rows = this._table.rows

    if (index === 0) {
      this.removeButtons(1)
    }

    this.insertCol(index)
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(index)
      cell.colSpan = 1
      cell.rowSpan = 1
      this._fillCell(cell)
    }

    if (!this.readOnly) {
      this.updateButtons()
    }
  }

  addColumnOnRight() {
    const table = this._table
    const isSelectedCellMerged = this.selectedCell.colSpan > 1 || this.selectedCell.rowSpan > 1
    const edgeIndex = this.selectedCell.colSpan + this.selectedCell.cellIndex - 1
    const index = isSelectedCellMerged ? edgeIndex : this.selectedCell.cellIndex
    const isLastColumn = index === table.rows[0].cells.length - 1

    const fillCell = (cell, isFirstRow) => {
      if (isFirstRow && this.isRowHeaderOn) {
        this._fillCell(cell)
        turnTdIntoTh(cell)
        return
      }

      this._fillCell(cell)
    }

    if (isLastColumn) {
      this.addColumn()
      return
    }

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i]
      const cellInColumn = row.cells[index]
      const isFirstRow = i === 0
      const isInvisibleCell = cellInColumn.style.display === "none"
      const isMainMergedCell = cellInColumn.colSpan > 1 || cellInColumn.rowSpan > 1
      const isNormalCell =
        cellInColumn.colSpan === 1 &&
        cellInColumn.rowSpan === 1 &&
        cellInColumn.style.display !== "none"

      if (isNormalCell) {
        const newCell = row.insertCell(index + 1)

        newCell.colSpan = 1
        newCell.rowSpan = 1

        fillCell(newCell, isFirstRow)
        continue
      }

      if (isMainMergedCell) {
        const newCell = row.insertCell(index + 1)

        cellInColumn.colSpan += 1

        fillCell(newCell, isFirstRow)
        hideCell(newCell)
        continue
      }

      if (isInvisibleCell) {
        const mainMergedCell = this.searchMainMergedCell(cellInColumn)
        const isOnSameRowWithMainCell = i === mainMergedCell.parentNode.rowIndex
        const isOnRightEdgeOfMainCell =
          index === mainMergedCell.cellIndex + mainMergedCell.colSpan - 1

        if (isOnRightEdgeOfMainCell) {
          const newCell = row.insertCell(index + 1)

          newCell.colSpan = 1
          newCell.rowSpan = 1

          fillCell(newCell, isFirstRow)
          continue
        }

        if (isOnSameRowWithMainCell) {
          const newCell = row.insertCell(index + 1)

          mainMergedCell.colSpan += 1

          fillCell(newCell, isFirstRow)
          hideCell(newCell)
          continue
        }

        const newCell = row.insertCell(index + 1)

        fillCell(newCell, isFirstRow)
        hideCell(newCell)
        continue
      }
    }

    this._numberOfColumns++
    this.insertCol(index + 1)
    this.updateButtons()
  }

  /**
   *
   * @param {HTMLTableCellElement} cell
   */
  searchMainMergedCell(cell) {
    const table = this._table
    const rowIndex = cell.parentNode.rowIndex
    const colIndex = cell.cellIndex
    const cells = table.querySelectorAll("td,th")
    const mainMergedCells = Array.from(cells).filter((cell) => cell.colSpan > 1 || cell.rowSpan > 1)

    return mainMergedCells.find((mainCell) => {
      const mainCellRowIndex = mainCell.parentNode.rowIndex
      const mainCellColindex = mainCell.cellIndex
      const mainCellMaxRowIndex = mainCellRowIndex + (mainCell.rowSpan - 1)
      const mainCellMaxColIndex = mainCellColindex + (mainCell.colSpan - 1)

      return (
        mainCellRowIndex <= rowIndex &&
        rowIndex <= mainCellMaxRowIndex &&
        mainCellColindex <= colIndex &&
        colIndex <= mainCellMaxColIndex
      )
    })
  }

  removeColumn(index) {
    const table = this._table
    const isFirstColumn = index === 0

    if (isFirstColumn) {
      this.isColHeaderOn = false
    }

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i]
      const cellInColumn = row.cells[index]

      // 현재 셀이 합쳐진 셀의 본체라면, 셀의 colspan, rowspan 만큼의 범위를 순회하며 거치는 모든 셀을 해방합니다.
      // 그리고 인덱스에 해당하는 셀을 삭제합니다.
      if (cellInColumn.colSpan > 1) {
        const colspan = cellInColumn.colSpan
        const rowspan = cellInColumn.rowSpan

        for (let j = i; j < i + rowspan; j++) {
          for (let k = index; k < index + colspan; k++) {
            const cell = table.rows[j].cells[k]

            showHiddenCell(cell)
          }

          table.rows[j].deleteCell(index)
        }

        i += rowspan - 1
        continue
      }

      // 현재 셀이 합쳐진 셀의 일부라면 왼쪽으로 탐색하며 합쳐진 셀의 본체를 찾습니다.
      // 본체를 찾았다면 본체의 colSpan 을 1 깎고 반복문을 종료합니다.
      if (cellInColumn.style.display === "none") {
        for (let j = index - 1; j >= 0; j--) {
          const leftCell = row.cells[j]

          if (leftCell.colSpan > 1) {
            leftCell.colSpan -= 1
            break
          }

          if (leftCell.style.display !== "none") {
            break
          }
        }
      }

      this._table.rows[i].deleteCell(index)
    }

    this._numberOfColumns--
    this._removeInvisibleRows()

    if (!this.readOnly) {
      this.removeCol(index)
      this.updateButtons()
    }
  }

  /**
   * Add row in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   * @returns {HTMLElement} row
   */
  addRow(index = -1) {
    this._numberOfRows++
    const row = this._table.insertRow(index)

    if (index === 0) {
      this.removeButtons(0)
    }

    this._fillRow(row, index)
    this.updateButtons()
    return row
  }

  addRowBelow() {
    const table = this._table
    const isSelectedCellMerged = this.selectedCell.colSpan > 1 || this.selectedCell.rowSpan > 1
    const edgeIndex = this.selectedCell.rowSpan + this.selectedCell.parentNode.rowIndex - 1
    const index = isSelectedCellMerged ? edgeIndex : this.selectedCell.parentNode.rowIndex
    const isLastRow = index === table.rows.length - 1

    const fillCell = (cell, isFirstColumn) => {
      if (isFirstColumn && this.isColHeaderOn) {
        this._fillCell(cell)
        turnTdIntoTh(cell)
        return
      }

      this._fillCell(cell)
    }

    if (isLastRow) {
      this.addRow()
      return
    }

    const newRow = table.insertRow(index + 1)

    for (let i = 0; i < table.rows[index].cells.length; i++) {
      const cell = table.rows[index].cells[i]
      const isInvisibleCell = cell.style.display === "none"
      const isMainMergedCell = cell.colSpan > 1 || cell.rowSpan > 1
      const isNormalCell = cell.colSpan === 1 && cell.rowSpan === 1 && cell.style.display !== "none"
      const isFirstColumn = i === 0

      if (isNormalCell) {
        const newCell = newRow.insertCell(i)

        newCell.colSpan = 1
        newCell.rowSpan = 1

        fillCell(newCell, isFirstColumn)
        continue
      }

      if (isMainMergedCell) {
        const newCell = newRow.insertCell(i)

        cell.rowSpan += 1

        fillCell(newCell, isFirstColumn)
        hideCell(newCell)
        continue
      }

      if (isInvisibleCell) {
        const mainMergedCell = this.searchMainMergedCell(cell)
        const isOnSameColumnWithMainCell = i === mainMergedCell.cellIndex
        const isAtBottomOfMaincell =
          index === mainMergedCell.parentNode.rowIndex + mainMergedCell.rowSpan - 1

        if (isAtBottomOfMaincell) {
          const newCell = newRow.insertCell(i)

          newCell.colSpan = 1
          newCell.rowSpan = 1

          fillCell(newCell, isFirstColumn)
          continue
        }

        if (isOnSameColumnWithMainCell) {
          const newCell = newRow.insertCell(i)

          mainMergedCell.rowSpan += 1

          fillCell(newCell, isFirstColumn)
          hideCell(newCell)
          continue
        }

        const newCell = newRow.insertCell(i)

        fillCell(newCell, isFirstColumn)
        hideCell(newCell)
        continue
      }
    }

    this._numberOfRows++
    this.updateButtons()
  }

  removeRow(index) {
    const table = this._table
    const selectedRow = table.rows[index]
    const isFirstRow = index === 0

    if (isFirstRow) {
      this.isRowHeaderOn = false
    }

    for (let i = 0; i < selectedRow.cells.length; i++) {
      const cell = selectedRow.cells[i]

      // 현재 셀이 합쳐진 셀의 본체라면, 아래로 탐색하며 소속된 셀을 전부 해방합니다.
      // 같은 줄에 소속된 셀이 있다면 삭제될 것이니 건너뜁니다.
      if (cell.rowSpan > 1) {
        for (let j = index + 1; j < table.rows.length; j++) {
          for (let k = i; k < i + cell.colSpan; k++) {
            const cellBelow = table.rows[j].cells[k]

            showHiddenCell(cellBelow)
          }
        }
      }

      if (cell.colSpan > 1) {
        i += cell.colSpan
      }

      // 현재 셀이 합쳐진 셀의 일부라면 위로 탐색하며 합쳐진 셀의 본체를 찾습니다.
      // 본체를 찾았다면 본체의 rowSpan 을 1 깎고 반복문을 종료합니다.
      if (cell.style.display === "none") {
        for (let j = index - 1; j >= 0; j--) {
          const upperRow = table.rows[j]
          const cellInUpperRow = upperRow.cells[i]

          if (cellInUpperRow.rowSpan > 1) {
            cellInUpperRow.rowSpan -= 1
            break
          }

          if (cellInUpperRow.style.display !== "none") {
            break
          }
        }
      }
    }

    this._numberOfRows--
    table.rows[index].remove()
    this.updateButtons()
  }

  mergeCells() {
    const table = this._table
    const everyCell = table.querySelectorAll("td,th")
    const selectedCells = Array.from(everyCell).filter((cell) =>
      cell.classList.contains("selected")
    )

    const topLeftCell = selectedCells[0]
    const bottomRightCell = selectedCells[selectedCells.length - 1]

    const colSpan = bottomRightCell.cellIndex - topLeftCell.cellIndex + 1
    const rowSpan = bottomRightCell.parentNode.rowIndex - topLeftCell.parentNode.rowIndex + 1

    selectedCells.forEach((cell, i) => {
      // 첫 번째 셀의 colspan, rowspan 을 늘리고 나머지 셀을 숨긴다.
      if (i === 0) {
        cell.colSpan = colSpan
        cell.rowSpan = rowSpan
      } else {
        hideCell(cell)
      }
    })

    this._removeInvisibleRows()
    // remove invisible columns?
  }

  checkIfMergePossible() {
    if (!this.selectedCols.length && !this.selectedRows.length) {
      return false
    }

    const table = this._table

    let everySelectedCells = 0
    let visibleSelectedCells = 0

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i]

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j]

        if (cell.classList.contains("selected")) {
          everySelectedCells += 1

          if (cell.style.display !== "none") {
            visibleSelectedCells += cell.colSpan * cell.rowSpan
          }
        }
      }
    }

    return everySelectedCells === visibleSelectedCells
  }

  unmerge() {
    const table = this._table
    const selectedCell = this.selectedCell
    const rowIndex = selectedCell.parentNode.rowIndex
    const cellIndex = selectedCell.cellIndex
    const rowSpan = selectedCell.rowSpan
    const colSpan = selectedCell.colSpan

    for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
      for (let j = cellIndex; j < cellIndex + colSpan; j++) {
        const cell = table.rows[i].cells[j]

        if (i === rowIndex && j === cellIndex) {
          cell.colSpan = 1
          cell.rowSpan = 1
          continue
        }

        showHiddenCell(cell)
      }
    }
  }

  toggleFirstRowHeader() {
    const table = this._table
    const firstRow = table.rows[0]

    for (let i = 0; i < firstRow.cells.length; i++) {
      if (this.isRowHeaderOn) {
        turnThIntoTd(firstRow.cells[i])
      } else {
        turnTdIntoTh(firstRow.cells[i])
      }
    }

    if (this.isRowHeaderOn) {
      this.isRowHeaderOn = false
    } else {
      this.isRowHeaderOn = true
    }
  }

  toggleFirstColHeader() {
    const table = this._table

    for (let i = 0; i < table.rows.length; i++) {
      const cell = table.rows[i].cells[0]

      if (this.isColHeaderOn) {
        turnThIntoTd(cell)
      } else {
        turnTdIntoTh(cell)
      }
    }

    if (this.isColHeaderOn) {
      this.isColHeaderOn = false
    } else {
      this.isColHeaderOn = true
    }
  }

  /**
   * get html element of table
   *
   * @returns {HTMLElement}
   */
  get htmlElement() {
    return this._element
  }

  /**
   * get real table tag
   *
   * @returns {HTMLElement}
   */
  get body() {
    return this._table
  }

  /**
   * returns selected/editable cell
   *
   * @returns {HTMLElement}
   */
  get selectedCell() {
    return this._selectedCell
  }

  get withBorder() {
    return
  }

  /**
   * 가로줄에 있는 모든 셀이 display="none" 이 되는 경우에 해당 Row 를 삭제한다.
   *
   * @returns 위 조건에 해당하는 Row 의 갯수를 반환한다.
   */
  _removeInvisibleRows() {
    const table = this._table
    const invisibleRows = []

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i]
      const isEveryCellInvisible = Array.from(row.cells).every(
        (cell) => cell.style.display === "none"
      )

      if (isEveryCellInvisible) {
        invisibleRows.push(i)
      }
    }

    invisibleRows.forEach((index, i) => {
      this.removeRow(index - i)
    })

    // 테이블의 row 가 하나로 줄어든다면 모든 셀의 rowSpan 을 1 로 보정합니다.
    if (table.rows.length === 1) {
      for (let i = 0; i < table.rows[0].cells.length; i++) {
        const cell = table.rows[0].cells[i]

        cell.rowSpan = 1
      }
    }

    return invisibleRows.length
  }

  /**
   * @private
   * @returns {HTMLElement} tbody - where rows will be
   */
  _createTableWrapper() {
    const className = this.readOnly ? CSS.containerReadOnly : CSS.container
    const wrapper = create("div", [className], null, [
      create("div", [CSS.wrapper], null, [
        create("table", [CSS.table], null, [create("colgroup"), create("tbody")]),
      ]),
    ])

    if (!this.readOnly) {
      // const addRowButton = create("div", [CSS.addRowButton])
      // const addColumnButton = create("div", [CSS.addColumnButton])
      // addRowButton.addEventListener("click", () => this.addColumn(this._numberOfColumns), true)
      // addColumnButton.addEventListener("click", () => this.addRow(this._numberOfRows), true)
      // wrapper.appendChild(addRowButton)
      // wrapper.appendChild(addColumnButton)
    }

    return wrapper
  }

  /**
   * @private
   * @returns {HTMLElement} - the area
   */
  _createContentEditableArea() {
    return create("div", [CSS.inputField], { contentEditable: !this.readOnly })
  }

  /**
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    const content = this._createContentEditableArea()

    this.cellMenu.createElem(cell)
    cell.classList.add(CSS.cell)
    cell.appendChild(create("div", [CSS.area], null, [content]))
  }

  /**
   * @private
   * @param row = the empty row
   */
  _fillRow(row) {
    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell()

      this._fillCell(cell)
    }
  }

  /**
   * @private
   */
  _hangEvents() {
    this._table.addEventListener("focus", this._focusEditField.bind(this), true)

    this._table.addEventListener("blur", this._blurEditField.bind(this), true)

    this._table.addEventListener("keydown", this._shortcutKeys.bind(this))

    this._table.addEventListener("mousedown", this._mouseDownOnCell.bind(this))

    this._table.addEventListener("mouseover", this._mouseEnterInDetectArea.bind(this), true)
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _focusEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return
    }

    this._selectedCell = event.target.closest("." + CSS.cell)

    const optionButton = this.selectedCell.querySelector("." + CellMenuCSS.openCellMenuButton)

    optionButton.style.visibility = "visible"
    // this.imageUpload.onToggle(true);
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _blurEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return
    }

    const lastSelectedCell = event.target.closest("." + CSS.cell)
    const optionButton = lastSelectedCell.querySelector("." + CellMenuCSS.openCellMenuButton)

    optionButton.style.visibility = "hidden"

    // this.imageUpload.onToggle(false);
  }

  /**
   * @private
   * @param {KeyboardEvent} event
   */
  _shortcutKeys(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return
    }
    if (event.key === "Enter") {
      this.shortcuts.handleEnterKeyPress(event)
      return
    }
    if (event.key === "Tab") {
      this.shortcuts.handleTabKeyPress(event)
      return
    }
    if (event.key === "ArrowUp") {
      this.shortcuts.handleArrowUpKeyPress(event)
      return
    }
    if (event.key === "ArrowDown") {
      this.shortcuts.handleArrowDownKeyPress(event)
      return
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseDownOnCell(event) {
    if (event.button !== 0) return
    if (event.target.closest("." + CellMenuCSS.openCellMenuButton)) return
    if (!event.target.closest("td,th")) return

    const table = this._table
    const cell = event.target.closest("td,th")
    const startRowIndex = cell.parentNode.rowIndex
    const startColIndex = cell.cellIndex
    let currentCell = cell
    this.selectedRows = []
    this.selectedCols = []

    const handleMouseMove = (event) => {
      if (!event.target.closest("td,th")) return

      const elementBelowMousePointer = document.elementFromPoint(event.clientX, event.clientY)
      const cellBelowMousePointer = elementBelowMousePointer.closest("td,th")
      const currentRowIndex = cellBelowMousePointer.parentNode.rowIndex
      const currentColIndex = cellBelowMousePointer.cellIndex

      if (currentCell !== cellBelowMousePointer) {
        this.deselectCells()
        selectCells(currentRowIndex, currentColIndex)
        cellBelowMousePointer.querySelector("." + CSS.inputField).focus()

        currentCell = cellBelowMousePointer
      }
    }

    const handleMouseUp = (event) => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    const selectCells = (currentRowIndex, currentColIndex) => {
      const currentCell = table.rows[currentRowIndex].cells[currentColIndex]
      const isLastCellMerged = currentCell.colSpan > 1 || currentCell.rowSpan > 1
      let additionalRow = 0
      let additionalCol = 0
      this.selectedRows = []
      this.selectedCols = []

      if (isLastCellMerged) {
        additionalRow += currentCell.rowSpan - 1
        additionalCol += currentCell.colSpan - 1
      }

      for (let i = startRowIndex; i <= currentRowIndex + additionalRow; i++) {
        const cellsInRow = table.rows[i].cells

        for (let j = startColIndex; j <= currentColIndex + additionalCol; j++) {
          const cell = cellsInRow[j]

          cell.classList.add("selected")
        }

        this.selectedRows.push(i)
      }

      for (let i = startColIndex; i <= currentColIndex + additionalCol; i++) {
        this.selectedCols.push(i)
      }
    }

    this.deselectCells()
    this.cellMenu.hideCellMenu()

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseEnterInDetectArea(event) {
    if (!event.target.classList.contains(CSS.area)) {
      return
    }

    const coordsCell = getCoords(event.target.closest("TD,TH"))
    const side = getSideByCoords(coordsCell, event.pageX, event.pageY)

    event.stopPropagation()
    event.target.dispatchEvent(
      new CustomEvent("mouseInActivatingArea", {
        detail: {
          side: side,
        },
        bubbles: true,
      })
    )
  }
}
