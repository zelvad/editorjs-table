import { create } from "./documentUtils"

const CSS = {
  resizedColumn: "tc-table__resize_column",
}

export class Resize {
  constructor(table) {
    this.table = table
    this.init()

    this.active = null
    this.activeIndex = 0
    this.startX = 0
    this.x = 0
  }

  init() {
    document.addEventListener("mousemove", this.onDrag, false)
    document.addEventListener("mouseup", this.onDragEnd, false)
  }

  createElem(cell) {
    if (!cell.querySelector(`.${CSS.resizedColumn}`)) {
      const elem = create("div", [CSS.resizedColumn])
      elem.dataset.index = cell.cellIndex
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
    const parentCellColIndex = e.target.closest("td,th").cellIndex
    const resizeStickIndex = parentCellColIndex - 1
    this.startX = e.pageX
    this.active = e.target
    this.activeIndex = resizeStickIndex
    this.width = this.table.body.offsetWidth
    const [w1, w2] = this.getWidthCols()
    this.widthFirst = w1
    this.widthSecond = w2

    this._highlightResizeStick(parentCellColIndex)

    document.body.style.cursor = "col-resize"

    e.preventDefault && e.preventDefault()
    e.stopPropagation && e.stopPropagation()
  }

  onDrag = (e) => {
    if (this.active) {
      this.move(e.pageX - this.startX)
    }
  }

  onDragEnd = () => {
    this.active = null
    document.body.style.cursor = "auto"
    this._dehighlightResizeStick(this.activeIndex + 1)
  }

  move = (delta) => {
    const [first, second] = this.getCols()
    let w1 = (this.widthFirst / this.width + delta / this.width) * 100
    let w2 = (this.widthSecond / this.width - delta / this.width) * 100

    if (w1 >= 5 && w2 >= 5) {
      first.style.width = `${w1}%`
      second.style.width = `${w2}%`
    }
  }

  getCols = () => {
    const cols = this.table.colgroup.children
    const first = cols[this.activeIndex]
    const second = cols[this.activeIndex + 1]
    return [first, second]
  }

  parseWidth = (e) => {
    return (Number.parseFloat(e.style.width) / 100) * this.width
  }

  getWidthCols = () => {
    const [first, second] = this.getCols()
    return [this.parseWidth(first), this.parseWidth(second)]
  }

  _highlightResizeStick = (index) => {
    const resizeSticksInColumn = this.table.body.querySelectorAll(`[data-index='${index}']`)

    resizeSticksInColumn.forEach((stick) => {
      stick.style.opacity = 1
    })
  }

  _dehighlightResizeStick = (index) => {
    const resizeSticksInColumn = this.table.body.querySelectorAll(`[data-index='${index}']`)

    resizeSticksInColumn.forEach((stick) => {
      stick.style.removeProperty("opacity")
    })
  }
}
