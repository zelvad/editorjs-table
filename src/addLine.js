import { create } from "./documentUtils"

export const CSS = {
  addColumnButton: "tc-table__add_column_button",
  addRowButton: "tc-table__add_row_button",
}

export class AddLine {
  constructor(table) {
    /**
     * @private
     */
    this._table = table
  }

  createAddRowButton() {
    const addRowButton = create("div", [CSS.addRowButton])

    addRowButton.addEventListener("click", () =>
      this._table.addColumn(this._table._numberOfColumns)
    )

    return addRowButton
  }

  createAddColButton() {
    const addColumnButton = create("div", [CSS.addColumnButton])

    addColumnButton.addEventListener("click", () => this._table.addRow(this._table._numberOfRows))

    return addColumnButton
  }
}
