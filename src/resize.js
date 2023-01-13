import { create } from "./documentUtils"

const CSS = {
  resizedColumn: "tc-table__resize_column",
}

const MIN_COL_WIDTH = 50

export class Resize {
  constructor(table) {
    this.table = table
    this.resizeStick = null
    this.resizeStickIndex = 0
    this.isLastResizeStick = false
    this.startX = 0
    this.x = 0

    this.init()
  }

  init() {
    document.addEventListener("mousemove", this.onDrag, false)
    document.addEventListener("mouseup", this.onDragEnd, false)
  }

  createElem(cell) {
    if (!cell.querySelector(`.${CSS.resizedColumn}`)) {
      const elem = create("div", [CSS.resizedColumn])
      elem.addEventListener("mousedown", this.onDragStart, false)
      cell.appendChild(elem)
    }
  }

  getIndex = (e) => {
    const items = this.table.body.querySelectorAll(`.${CSS.resizedColumn}`)
    for (let i = 0; i < items.length; i += 1) {
      if (items[i] === e.target) {
        return i
      }
    }
    return -1
  }

  onDragStart = (e) => {
    const columnCount = this.table.body.rows[0].cells.length
    const parentCellColIndex = e.target.closest("td,th").cellIndex
    const resizeStickIndex = parentCellColIndex - 1

    this.startX = e.clientX
    this.resizeStick = e.target
    this.resizeStickIndex = resizeStickIndex
    this.width = this.table.body.offsetWidth

    if (columnCount === parentCellColIndex + 1) {
      this.isLastResizeStick = true
    }

    const [w1, w2] = this.getWidthCols()

    // 왼쪽 셀 너비
    this.widthFirst = w1
    // 오른쪽 셀 너비
    this.widthSecond = w2

    document.body.style.cursor = "col-resize"

    e.preventDefault && e.preventDefault()
    e.stopPropagation && e.stopPropagation()
  }

  onDrag = (e) => {
    if (this.resizeStick) {
      this.move(e.clientX - this.startX)
    }
  }

  onDragEnd = () => {
    this.resizeStick = null
    this.isLastResizeStick = false
    document.body.style.cursor = "auto"
  }

  move = (delta) => {
    const [first, second] = this.getCols()
    const w1 = this.widthFirst + delta
    const w2 = this.widthSecond - delta

    if (w1 >= MIN_COL_WIDTH) {
      first.style.width = `${w1}px`

      if (w1 >= MIN_COL_WIDTH && w2 >= MIN_COL_WIDTH) {
        second.style.width = `${w2}px`
      }
    }
  }

  getCols = () => {
    const cols = this.table.colgroup.children
    const first = cols[this.resizeStickIndex]
    const second = cols[this.resizeStickIndex + 1]
    return [first, second]
  }

  parseWidth = (col) => {
    const width = col.style.width || col.getBoundingClientRect().width
    return Number.parseFloat(width)
  }

  getWidthCols = () => {
    const [first, second] = this.getCols()
    return [this.parseWidth(first), this.parseWidth(second)]
  }
}
