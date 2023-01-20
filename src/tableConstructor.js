import "./styles/table-constructor.scss"
import { create } from "./documentUtils"
import { Table } from "./table"
import { AddLine } from "./addLine"

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
      this._table = new Table(config, api, readOnly)
      this._addLine = new AddLine(this._table)
      this._drawTable(data, config)
    } catch (e) {
      console.error(e)
    }

    this._container = create("div", [this._CSS.editor, api.styles.block], null, [
      this._table.htmlElement,
    ])

    if (!this.readOnly) {
      this._container.appendChild(this._addLine.createAddRowButton())
      this._container.appendChild(this._addLine.createAddColButton())
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
  _drawTable(data, config) {
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
}
