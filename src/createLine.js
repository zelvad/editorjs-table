import { create } from "./documentUtils"

export const CSS = {
  addColumn: "tc-table__add_column",
  addRow: "tc-table__add_row",
}

export class CreateLine {
  constructor(table) {
    this.table = table
  }

  /**
   * @private
   * @returns {HTMLElement} - the create col/row
   */
  createElem = (cell, direction = 0) => {
    const className = [CSS.addColumn, CSS.addRow][direction]
    if (!cell.querySelector(`.${className}`)) {
      const plusButton = create("div")
      plusButton.addEventListener("click", this.onClick)

      const line = create("div", [className], null, [plusButton, create("div")])

      cell.appendChild(line)
      return line
    }
  }

  getDirection = (elem) => {
    if (elem.classList.contains(CSS.addColumn)) return 0
    return 1
  }

  getIndex = (elem) => {
    const items = this.table.body.querySelectorAll(`.${elem.className}`)
    for (let i = 0; i < items.length; i += 1) {
      if (items[i] === elem) {
        return i
      }
    }
    return -1
  }

  onClick = (e) => {
    const parent = e.target.parentNode
    const direction = this.getDirection(parent)
    const index = this.getIndex(parent)

    if (direction === 0) {
      this.table.addColumn(index)
    } else {
      this.table.addRow(index)
    }
  }
}
