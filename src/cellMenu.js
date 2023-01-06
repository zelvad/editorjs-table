import { create } from "./documentUtils";
import chevronDown from './img/chevron-down.svg';

export class CellMenu {
  constructor(table) {
    const cellMenu = document.createElement('div'); 
    const cellMenuInner = document.createElement('div');

    cellMenu.appendChild(cellMenuInner);
    cellMenu.classList.add(CSS.cellMenu);
    cellMenuInner.classList.add(CSS.cellMenuInner);

    
    this.table = table;
    this.container = cellMenu;
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
    openCellMenuButton.addEventListener('click', this._handleClick.bind(this));
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

  _fillCellMenu() {
    const mergeButton = this._createMergeButton.call(this.table);

    this._cellMenuInner.appendChild(mergeButton);
  }

  _handleMouseDown(event) {
    event.preventDefault();
  }

  _handleClick(event) {
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
  disabledOption: 'tc-table__option_table__inner__option_disabled',
  mergeOption: 'merge-option'
}
