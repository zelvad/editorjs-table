import "./styles/table-constructor.scss"
import { create } from "./documentUtils"
import { Table } from "./table"

/**
 * Entry point. Controls table and give API to user
 */
export class TableConstructor {
  /**
   * Creates
   * @param {TableData} data - previously saved data for insert in table
   * @param {object} config - configuration of table
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(data, config, api, readOnly) {
    this.readOnly = readOnly

    this._CSS = {
      editor: "tc-editor",
      inputField: "tc-table__inp",
      withBorder: "tc-table__with_border",
    }

    /** creating table */

    try {
      this._table = new Table(readOnly)
      this._resizeTable(data, config)
    } catch (e) {
      console.log(e)
    }

    /** creating container around table */
    this._container = create("div", [this._CSS.editor, api.styles.block], null, [
      this._table.htmlElement,
    ])

    /** Создаем кнопку для загрузки изображения */
    this._table.imageUpload.createElem(this._container)

    /** Activated elements */
    this._hoveredCell = null
    this._hoveredCellSide = null

    if (!this.readOnly) {
      this._hangEvents()
    }
  }

  /**
   * returns html element of TableConstructor;
   * @return {HTMLElement}
   */
  get htmlElement() {
    return this._container
  }

  /**
   * @private
   *
   * resize to match config or transmitted data
   * @param {TableData} data - data for inserting to the table
   * @param {object} config - configuration of table
   * @param {number|string} config.rows - number of rows in configuration
   * @param {number|string} config.cols - number of cols in configuration
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  _resizeTable(data, config) {
    const isDataValid = !!data && Array.isArray(data.rows) && Array.isArray(data.colgroup)
    const contentRows = isDataValid ? data.rows.length : undefined
    const contentCols = isDataValid ? data.colgroup.length : undefined
    const configRows = Number.parseInt(config.rows)
    const configCols = Number.parseInt(config.cols)
    const defaultRows = 3
    const defaultCols = 2
    const rows = contentRows || configRows || defaultRows
    const cols = contentCols || configCols || defaultCols
    const table = this._table

    if (!isDataValid) {
      for (let i = 0; i < rows; i++) {
        table.addRow(i)
      }
      for (let i = 0; i < cols; i++) {
        table.addColumn(i)
      }

      table.htmlElement.classList.toggle(this._CSS.withBorder, true)
    } else {
      table.htmlElement.classList.toggle(this._CSS.withBorder, true)
      this._table.drawTableFromData(data)
    }

    return {
      rows: rows,
      cols: cols,
    }
  }

  /**
   * @private
   *
   * hang necessary events
   */
  _hangEvents() {
    this._container.addEventListener("keydown", (event) => {
      this._containerKeydown(event)
    })
  }

  /**
   * @private
   *
   * detects button presses when editing a table's content
   * @param {KeyboardEvent} event
   */
  _containerKeydown(event) {
    if (event.keyCode === 13) {
      this._containerEnterPressed(event)
    }
  }

  /**
   * @private
   *
   * Check if the addition is initiated by the container and which side
   * @returns {number} - -1 for left or top; 0 for bottom or right; 1 if not container
   */
  _getHoveredSideOfContainer() {
    if (this._hoveredCell === this._container) {
      return this._isBottomOrRight() ? 0 : -1
    }
    return 1
  }

  /**
   * @private
   *
   * check if hovered cell side is bottom or right. (lefter in array of cells or rows than hovered cell)
   * @returns {boolean}
   */
  _isBottomOrRight() {
    return this._hoveredCellSide === "bottom" || this._hoveredCellSide === "right"
  }

  /**
   * @private
   *
   * if "cntrl + Eneter" is pressed then create new line under current and focus it
   * @param {KeyboardEvent} event
   */
  _containerEnterPressed(event) {
    if (!(this._table.selectedCell !== null && !event.shiftKey)) {
      return
    }
    const indicativeRow = this._table.selectedCell.closest("TR")
    let index = this._getHoveredSideOfContainer()

    if (index === 1) {
      index = indicativeRow.sectionRowIndex + 1
    }
    const newstr = this._table.addRow(index)

    newstr.cells[0].click()
  }
}
