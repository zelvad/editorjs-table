import { create } from "./documentUtils";
import chevronDown from './img/chevron-down.svg';
import { CSS as SelectLineCSS } from "./selectLine";

const COLORS = ['#ffffff', '#e0ebfd', '#eafbfe', '#e8fbf0', '#fefae8', '#fcece7', '#e9e6fd', '#f4f5f7', '#b9d4fb', '#c1f3fd', '#bbf3d3', '#fcf0ba', '#f5c0b0', '#beb7ee', '#b4bac4', '#5f9af8', '#93dfef', '#7cd5a7', '#f6c544', '#f0957a', '#978ed4'];

export class CellMenu {
  constructor(table) {
    const cellMenuInner = document.createElement('div');
    cellMenuInner.classList.add(CSS.cellMenuInner);

    const cellMenu = document.createElement('div'); 
    cellMenu.appendChild(cellMenuInner);
    cellMenu.classList.add(CSS.cellMenu);
   
    const colorPalette = document.createElement('div');
    colorPalette.classList.add(CSS.colorPalette);
    
    COLORS.forEach((color) => {
      const colorBlock = document.createElement('figure');
      colorBlock.style.backgroundColor = color;
      colorBlock.classList.add(CSS.colorBlock);
      colorBlock.setAttribute('data-color', color);
      colorPalette.appendChild(colorBlock);
    });

    this.table = table;
    this.container = cellMenu;
    this.colorPalette = colorPalette;
    this._cellMenuInner = cellMenuInner;

    this._fillCellMenu();
    
    this._cellMenuInner.addEventListener('click', this._catchClickEventDelegation.bind(this));
    this.colorPalette.addEventListener('click', this._changeCellColor.bind(this));
    this.colorPalette.addEventListener('mouseenter', this._showColorPalette.bind(this));
    this.colorPalette.addEventListener('mouseleave', this._hideColorPalette.bind(this))
  }

  createElem(cell) {
    const openCellMenuButton = create('button', [CSS.openCellMenuButton]);
    const iconContainer = create('div', [CSS.iconBox]);

    iconContainer.innerHTML = chevronDown;
    
    openCellMenuButton.appendChild(iconContainer);
    openCellMenuButton.addEventListener('mousedown', this._handleMouseDown.bind(this));
    openCellMenuButton.addEventListener('click', this._handleCellMenuButtonClick.bind(this));
    cell.appendChild(openCellMenuButton);
  }
  
  hideCellMenu() {
    this.container.style.visibility = 'hidden';

    this.table.body.querySelectorAll('.' + CSS.iconBox).forEach((iconBox) => {
      iconBox.classList.remove('activated');
    });
  }

  _createMergeButton() {
    const option = document.createElement('button');

    option.textContent = '셀 합치기'

    option.classList.add(CSS.option);
    option.classList.add(CSS.mergeOption);
    option.addEventListener('click', this.mergeCells.bind(this));

    return option;
  }

  _createColRemoveButton() {
    const option = document.createElement('button');

    const removeSelectedCols = (event) => {
      const focusedCell = this.selectedCell;
      const selectedCols = this.selectedCols;
  
      if (selectedCols.length === 0) {
        this.removeColumn(focusedCell.cellIndex);
        return;
      }
  
      selectedCols.forEach((row, i) => {
        this.removeColumn(row - i);
      });
    }

    option.textContent = '열 삭제하기'

    option.classList.add(CSS.option);
    option.addEventListener('click', removeSelectedCols.bind(this));

    return option;
  }

  _createRowRemoveButton() {
    const option = document.createElement('button');
    
    const removeSelectedRows = (event) => {
      const focusedCell = this.selectedCell;
      const selectedRows = this.selectedRows;
  
      if (selectedRows.length === 0) {
        this.removeRow(focusedCell.parentNode.rowIndex);
        return;
      }
  
      selectedRows.forEach((row, i) => {
        this.removeRow(row - i);
      });
    }

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

    option.textContent = '행 삭제하기'

    option.classList.add(CSS.option);
    option.addEventListener('click', removeSelectedRows.bind(this));
    option.addEventListener('mouseenter', highlightCells.bind(this));

    return option;
  }

  _createColorPickerButton() {
    const option = document.createElement('button');

    option.textContent = '셀 배경'
    
    option.classList.add(CSS.option);
    option.classList.add(CSS.colorOption);

    option.addEventListener('mouseenter', (event) => {
      const { top, left } = option.getBoundingClientRect();
      const { width } = this.colorPalette.getBoundingClientRect();

      this.colorPalette.style.top = `${top}px`;
      this.colorPalette.style.left = `${left - width}px`;
      this.colorPalette.style.visibility = 'visible';
    });

    option.addEventListener('mouseleave', (event) => {
      this.colorPalette.style.visibility = 'hidden';
    })

    return option;
  }

  _changeCellColor(event) {
    if (event.target.closest('.' + CSS.colorBlock)) {
      const color = event.target.dataset.color === COLORS[0] ? null : event.target.dataset.color;
      const selectedRows = this.table.selectedRows;
      const selectedCols = this.table.selectedCols;
      const selectedCell = this.table.selectedCell;

      this.colorPalette.style.visibility = 'hidden';
      this.hideCellMenu();

      if (!selectedRows.length && !selectedCols.length) {
        selectedCell.style.backgroundColor = color;
        this.table.deselectCells();
        return;
      }
      
      for (let i = selectedRows[0]; i <= selectedRows[selectedRows.length - 1]; i++) {
        for (let j = selectedCols[0]; j <= selectedCols[selectedCols.length - 1]; j++) {
          const cell = this.table.body.rows[i].cells[j];
          cell.style.backgroundColor = color;
        }
      }

      this.table.deselectCells();
    }
  }

  _hideColorPalette() {
    this.colorPalette.style.visibility = 'hidden';
  }

  _showColorPalette() {
    this.colorPalette.style.visibility = 'visible';
  }
  
  _fillCellMenu() {
    const colorPickerButton = this._createColorPickerButton();
    const mergeButton = this._createMergeButton.call(this.table);
    const rowRemoveButton = this._createRowRemoveButton.call(this.table);
    const colRemoveButton = this._createColRemoveButton.call(this.table);

    this._cellMenuInner.appendChild(colorPickerButton);
    this._cellMenuInner.appendChild(mergeButton);
    this._cellMenuInner.appendChild(rowRemoveButton);
    this._cellMenuInner.appendChild(colRemoveButton);
  }

  /**
   * 메뉴 창 닫기를 방지합니다.
   * 
   * @param {MouseEvent} event 
   */
  _handleMouseDown(event) {
    event.preventDefault();
  }

  _handleCellMenuButtonClick(event) {
    const openCellMenuButton = event.target.closest('.' + CSS.openCellMenuButton);
    const iconBox = openCellMenuButton.querySelector('.' + CSS.iconBox);
    const mergeOption = this.container.querySelector('.' + CSS.mergeOption);
    const { top, right } = iconBox.getBoundingClientRect();

    iconBox.classList.add('activated');
    
    this.container.style.top = `${top}px`;
    this.container.style.left = `${right + 4}px`;
    this.container.style.visibility = 'visible';
    
    if (this.table.checkIfMergePossible.call(this.table)) {
      mergeOption.disabled = false;
      return;
    }
    
    mergeOption.disabled = true;
  }

  _catchClickEventDelegation(event) {
    if (event.target.classList.contains(CSS.option)) {
      this.hideCellMenu();
    }
  }

}

export const CSS = {
  openCellMenuButton: 'tc-table__option_button',
  iconBox: 'tc-table__option_button__inner_box',
  cellMenu: 'tc-table__option_table',
  cellMenuInner: 'tc-table__option_table__inner',
  option: 'tc-table__option_table__inner__option',
  mergeOption: 'merge-option',
  colorOption: 'color-option',
  colorPalette: 'color-palette',
  colorBlock: 'color-block'
}
