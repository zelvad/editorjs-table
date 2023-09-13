import { create } from "./documentUtils"
import chevronDown from "./img/chevron-down.svg"

const COLORS = [
  "#ffffff",
  "#e0ebfd",
  "#eafbfe",
  "#e8fbf0",
  "#fefae8",
  "#fcece7",
  "#e9e6fd",
  "#f4f5f7",
  "#b9d4fb",
  "#c1f3fd",
  "#bbf3d3",
  "#fcf0ba",
  "#f5c0b0",
  "#beb7ee",
  "#b4bac4",
  "#5f9af8",
  "#93dfef",
  "#7cd5a7",
  "#f6c544",
  "#f0957a",
  "#978ed4",
]

export class CellMenu {
  constructor(table, config, api) {
    this.table = table
    this._colors = config.colors || COLORS
    this.api = api

    /**
     * FIXME: 테이블 셀 메뉴와 컬러 팔레트가 무한 생성되는 현상을 수정해야 합니다.
     */
    this._init()
    this._fillCellMenu()
  }

  createElem(cell) {
    const openCellMenuButton = create("button", [CSS.openCellMenuButton])
    const iconContainer = create("div", [CSS.iconBox])

    iconContainer.innerHTML = chevronDown

    openCellMenuButton.appendChild(iconContainer)
    openCellMenuButton.addEventListener("mousedown", this._handleMouseDown.bind(this))
    openCellMenuButton.addEventListener("click", this._handleCellMenuButtonClick.bind(this))
    cell.appendChild(openCellMenuButton)
  }

  _hideCellMenu(event) {
    if (event.target.closest("." + CSS.openCellMenuButton)) return

    this.container.style.visibility = "hidden"

    this.table.body.querySelectorAll("." + CSS.iconBox).forEach((iconBox) => {
      iconBox.classList.remove("activated")
    })
  }

  _createMergeButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Merge Cells")

    option.classList.add(CSS.option)
    option.classList.add(CSS.mergeOption)
    option.addEventListener("click", this.mergeCells.bind(this))

    return option
  }

  _createUnmergeButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Divide Cell")

    option.classList.add(CSS.option)
    option.classList.add(CSS.unmergeOption)
    option.addEventListener("click", this.unmerge.bind(this))

    return option
  }

  _createAddColumnOnRightButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Insert Column On Right")

    option.classList.add(CSS.option)
    option.addEventListener("click", this.addColumnOnRight.bind(this))

    return option
  }

  _createAddRowBelow() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Insert Row Below")

    option.classList.add(CSS.option)
    option.addEventListener("click", this.addRowBelow.bind(this))

    return option
  }

  _createColRemoveButton() {
    const option = document.createElement("button")

    const removeSelectedCols = (event) => {
      const focusedCell = this.selectedCell
      const selectedCols = this.selectedCols

      if (selectedCols.length === 0) {
        this.removeColumn(focusedCell.cellIndex)
        return
      }

      selectedCols.forEach((row, i) => {
        this.removeColumn(row - i)
      })
    }

    option.textContent = this.api.i18n.t("Remove Column")

    option.classList.add(CSS.option)
    option.addEventListener("click", removeSelectedCols.bind(this))

    return option
  }

  _createRowRemoveButton() {
    const option = document.createElement("button")

    const removeSelectedRows = (event) => {
      const focusedCell = this.selectedCell
      const selectedRows = this.selectedRows

      if (selectedRows.length === 0) {
        this.removeRow(focusedCell.parentNode.rowIndex)
        return
      }

      selectedRows.forEach((row, i) => {
        this.removeRow(row - i)
      })
    }

    // 삭제할 행을 표시해주는 기능을 추가한다
    // https://stackoverflow.com/questions/49106088/changing-pseudo-element-style-from-javascript
    const highlightCells = (event) => {
      // const focusedCell = this.selectedCell;
      // const selectedCells = this._table.querySelectorAll('.selected');
      // if (selectedCells.length === 0) {
      //   focusedCell.parentNode.classList.add(SelectLineCSS.trRemove);
      //   return;
      // }
      // const topLeftRow = selectedCells[0].parentNode.rowIndex;
      // const bottomRightRow = selectedCells[selectedCells.length - 1].parentNode.rowIndex;
      // for (let i = topLeftRow; i <= bottomRightRow; i++) {
      //   this._table.rows[i].classList.add(SelectLineCSS.trRemove);
      // }
    }

    option.textContent = this.api.i18n.t("Remove Row")

    option.classList.add(CSS.option)
    option.addEventListener("click", removeSelectedRows.bind(this))
    // option.addEventListener("mouseenter", highlightCells.bind(this))

    return option
  }

  _createColorPickerButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Cell Color")

    option.classList.add(CSS.option)
    option.classList.add(CSS.colorOption)

    option.addEventListener("mouseenter", (event) => {
      const { top, left } = option.getBoundingClientRect()
      const scrollY = Math.floor(window.scrollY)
      const { width } = this.colorPalette.getBoundingClientRect()

      this.colorPalette.style.top = `${Math.floor(top) + scrollY}px`
      this.colorPalette.style.left = `${left - width}px`
      this.colorPalette.style.visibility = "visible"
    })

    option.addEventListener("mouseleave", (event) => {
      this.colorPalette.style.visibility = "hidden"
    })

    return option
  }

  _changeCellColor(event) {
    if (event.target.closest("." + CSS.colorBlock)) {
      const color =
        event.target.dataset.color === this._colors[0] ? null : event.target.dataset.color
      const selectedRows = this.table.selectedRows
      const selectedCols = this.table.selectedCols
      const selectedCell = this.table.selectedCell

      this.colorPalette.style.visibility = "hidden"
      this._hideCellMenu(event)

      if (!selectedRows.length && !selectedCols.length) {
        selectedCell.style.backgroundColor = color
        this.table.deselectCells()
        return
      }

      for (let i = selectedRows[0]; i <= selectedRows[selectedRows.length - 1]; i++) {
        for (let j = selectedCols[0]; j <= selectedCols[selectedCols.length - 1]; j++) {
          const cell = this.table.body.rows[i].cells[j]
          cell.style.backgroundColor = color
        }
      }

      this.table.deselectCells()
    }
  }

  _hideColorPalette() {
    this.colorPalette.style.visibility = "hidden"
  }

  _showColorPalette() {
    this.colorPalette.style.visibility = "visible"
  }

  _createToggleFirstRowHeaderButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Header Row")

    option.classList.add(CSS.option)
    option.classList.add(CSS.toggleRowHeaderOption)

    option.addEventListener("click", this.toggleFirstRowHeader.bind(this))

    return option
  }

  _createToggleFirstColHeaderButton() {
    const option = document.createElement("button")

    option.textContent = this.api.i18n.t("Header Column")

    option.classList.add(CSS.option)
    option.classList.add(CSS.toggleColHeaderOption)

    option.addEventListener("click", this.toggleFirstColHeader.bind(this))

    return option
  }

  _createAlignmentCenterButton() {
    const block = document.createElement("button")

    block.textContent = this.api.i18n.t("Text Center")

    block.classList.add(CSS.option)
    block.classList.add(CSS.toggleColHeaderOption)

    block.addEventListener("click", () => {
      this._setAlignment('center')
    })

    return block
  }

  _createAlignmentLeftButton() {
    const block = document.createElement("button")

    block.textContent = this.api.i18n.t("Text left")

    block.classList.add(CSS.option)
    block.classList.add(CSS.toggleColHeaderOption)

    block.addEventListener("click", () => {
      this._setAlignment('left');
    })

    return block
  }

  _createAlignmentRightButton() {
    const block = document.createElement("button")

    block.textContent = this.api.i18n.t("Text right")

    block.classList.add(CSS.option)
    block.classList.add(CSS.toggleColHeaderOption)

    block.addEventListener("click", () => {
      this._setAlignment('right');
    })

    return block
  }

  _setAlignment(align) {
    const selectedRows = this.table.selectedRows
    const selectedCols = this.table.selectedCols
    const selectedCell = this.table.selectedCell

    if (! selectedRows.length && ! selectedCols.length) {
      selectedCell.style.textAlign = align
      this.table.deselectCells()
      return
    }

    for (let i = selectedRows[0]; i <= selectedRows[selectedRows.length - 1]; i++) {
      for (let j = selectedCols[0]; j <= selectedCols[selectedCols.length - 1]; j++) {
        this
            .table
            .body
            .rows[i]
            .cells[j]
            .style
            .textAlign = align
      }
    }
  }

  _createCellGroup(name, blocks) {
    const groupBlock = document.createElement('div')
    const nameBlock = document.createElement('span')

    groupBlock.classList.add(CSS.group)
    nameBlock.innerText = name

    groupBlock.appendChild(nameBlock)

    blocks.forEach((block) => {
      groupBlock.appendChild(block)
    })

    return groupBlock
  }

  _fillCellMenu() {
    const headerGroup = this._createCellGroup(this.api.i18n.t('Header'), [
      this._createToggleFirstRowHeaderButton.call(this.table),
      this._createToggleFirstColHeaderButton.call(this.table),
    ]);

    const manageGroup = this._createCellGroup(this.api.i18n.t('Manage'), [
      this._createAddColumnOnRightButton.call(this.table),
      this._createAddRowBelow.call(this.table),
      this._createMergeButton.call(this.table),
      this._createUnmergeButton.call(this.table),
      this._createRowRemoveButton.call(this.table),
      this._createColRemoveButton.call(this.table),
    ])

    const styleGroup= this._createCellGroup(this.api.i18n.t('Style'), [
      this._createColorPickerButton(),
    ])

    const alignmentGroup= this._createCellGroup(this.api.i18n.t('Alignment'), [
        this._createAlignmentCenterButton(),
        this._createAlignmentLeftButton(),
        this._createAlignmentRightButton(),
    ])

    this._cellMenuInner.appendChild(headerGroup)
    this._cellMenuInner.appendChild(manageGroup)
    this._cellMenuInner.appendChild(styleGroup)
    this._cellMenuInner.appendChild(alignmentGroup)
  }

  /**
   * 메뉴 창 닫기를 방지합니다.
   *
   * @param {MouseEvent} event
   */
  _handleMouseDown(event) {
    event.preventDefault()
  }

  _handleCellMenuButtonClick(event) {
    const openCellMenuButton = event.target.closest("." + CSS.openCellMenuButton)
    const iconBox = openCellMenuButton.querySelector("." + CSS.iconBox)
    const mergeOption = this.container.querySelector("." + CSS.mergeOption)
    const unmergeOption = this.container.querySelector("." + CSS.unmergeOption)
    const toggleRowHeaderOption = this.container.querySelector("." + CSS.toggleRowHeaderOption)
    const toggleColHeaderOption = this.container.querySelector("." + CSS.toggleColHeaderOption)
    const { top, right } = iconBox.getBoundingClientRect()
    const scrollY = Math.floor(window.scrollY)
    const isMergePossible = this.table.checkIfMergePossible.call(this.table)
    const isCurrentCellMerged =
      this.table.selectedCell.colSpan > 1 || this.table.selectedCell.rowSpan > 1
    const isToggleRowHeaderPossible = this.table.selectedCell.parentNode.rowIndex === 0
    const isToggleColHeaderPossible = this.table.selectedCell.cellIndex === 0

    iconBox.classList.add("activated")

    const menuWidth = this.container.offsetWidth;
    const windowWidth = window.innerWidth;

    iconBox.classList.add("activated");

    this.container.style.top = `${Math.floor(top) + scrollY}px`;

    if (right + menuWidth > windowWidth) {
      this.container.style.left = `${iconBox.getBoundingClientRect().left - menuWidth - 4}px`;
    } else {
      this.container.style.left = `${right + 4}px`;
    }

    this.container.style.visibility = "visible";

    if (isToggleRowHeaderPossible) {
      toggleRowHeaderOption.style.display = "flex"

      this.table.isRowHeaderOn
        ? toggleRowHeaderOption.classList.add(CSS.rowHeaderOn)
        : toggleRowHeaderOption.classList.remove(CSS.rowHeaderOn)
    } else {
      toggleRowHeaderOption.style.display = "none"
    }

    if (isToggleColHeaderPossible) {
      toggleColHeaderOption.style.display = "flex"

      this.table.isColHeaderOn
        ? toggleColHeaderOption.classList.add(CSS.colHeaderOn)
        : toggleColHeaderOption.classList.remove(CSS.colHeaderOn)
    } else {
      toggleColHeaderOption.style.display = "none"
    }

    if (isMergePossible) {
      mergeOption.disabled = false
    } else {
      mergeOption.disabled = true
    }

    if (isCurrentCellMerged) {
      unmergeOption.style.display = "flex"
    } else {
      unmergeOption.style.display = "none"
    }
  }

  _init() {
    const cellMenuInner = document.createElement("div")
    cellMenuInner.classList.add(CSS.cellMenuInner)

    const cellMenu = document.createElement("div")
    cellMenu.appendChild(cellMenuInner)
    cellMenu.classList.add(CSS.cellMenu)

    const colorPalette = document.createElement("div")
    colorPalette.classList.add(CSS.colorPalette)

    this._colors.forEach((color) => {
      const colorBlock = document.createElement("figure")
      colorBlock.style.backgroundColor = color
      colorBlock.classList.add(CSS.colorBlock)
      colorBlock.setAttribute("data-color", color)
      colorPalette.appendChild(colorBlock)
    })

    this.container = cellMenu
    this.colorPalette = colorPalette
    this._cellMenuInner = cellMenuInner

    this._cellMenuInner.addEventListener("click", this._catchClickEventDelegation.bind(this))
    this.colorPalette.addEventListener("click", this._changeCellColor.bind(this))
    this.colorPalette.addEventListener("mouseenter", this._showColorPalette.bind(this))
    this.colorPalette.addEventListener("mouseleave", this._hideColorPalette.bind(this))

    document.body.appendChild(cellMenu)
    document.body.appendChild(colorPalette)
    document.addEventListener("click", this._hideCellMenu.bind(this))
  }

  _catchClickEventDelegation(event) {
    if (event.target.classList.contains(CSS.option)) {
      this._hideCellMenu(event)
    }
  }
}

export const CSS = {
  openCellMenuButton: "tc-table__option_button",
  iconBox: "tc-table__option_button__inner_box",
  cellMenu: "tc-table__option_table",
  cellMenuInner: "tc-table__option_table__inner",
  option: "tc-table__option_table__inner__option",
  mergeOption: "merge-option",
  unmergeOption: "unmerge-option",
  colorOption: "color-option",
  colorPalette: "tc-table__color-palette",
  colorBlock: "color-block",
  toggleRowHeaderOption: "toggle-row-header-option",
  toggleColHeaderOption: "toggle-col-header-option",
  rowHeaderOn: "row-header-on",
  colHeaderOn: "col-header-on",
  group: 'table_cell_group'
}
