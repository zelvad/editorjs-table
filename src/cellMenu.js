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
      colorPalette.appendChild(colorBlock);
    });

    this.table = table;
    this.container = cellMenu;
    this.colorPalette = colorPalette;
    this._cellMenuInner = cellMenuInner;

    this._fillCellMenu();
    this._cellMenuInner.addEventListener('click', this._catchClickEventDelegation.bind(this));
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
  
  hideOptionTable() {
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

  _createRowRemoveButton() {
    const option = document.createElement('button');
    
    const removeSelectedRows = (event) => {
      const focusedCell = this.selectedCell;
      const selectedRows = [];
  
      for (let i = 0; i < this._table.rows.length; i++) {
        const row = this._table.rows[i];
  
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
  
          if (cell.classList.contains('selected')) {
            selectedRows.push(i);
            break;
          }
        }
      }
  
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

    const hideColorPalette = () => {}

    option.addEventListener('mouseenter', (event) => {
      const { top, left } = option.getBoundingClientRect();
      const { width } = this.colorPalette.getBoundingClientRect();

      this.colorPalette.style.top = `${top}px`;
      this.colorPalette.style.left = `${left - width}px`;
    })

    return option;
  }
  
  _fillCellMenu() {
    const colorPickerButton = this._createColorPickerButton();
    const mergeButton = this._createMergeButton.call(this.table);
    const rowRemoveButton = this._createRowRemoveButton.call(this.table);

    this._cellMenuInner.appendChild(colorPickerButton);
    this._cellMenuInner.appendChild(mergeButton);
    this._cellMenuInner.appendChild(rowRemoveButton);
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
      this.hideOptionTable();
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
