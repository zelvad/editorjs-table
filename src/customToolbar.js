import { turnTdIntoTh, turnThIntoTd } from './documentUtils';
import trashIcon from './img/trash.svg';
import tableLeftHeader from './img/table-left-header.svg';
import tableTopHeader from './img/table-top-header.svg';
import tableNoHeader from './img/table-no-header.svg';
// import alignCenter from './img/align-center.svg';

export class Toolbar {
  constructor(table, api) {
    this.table = table;
    this.api = api;
    this.toolbar = document.createElement('div');

    this.toolbar.classList.add('table-toolbar');
  }

  createToolbar() {
    const toolbar = this.toolbar;

    const leftColumnTableHeaderButton = this._createFeatureButton('left-column-table-header');
    leftColumnTableHeaderButton.innerHTML = tableLeftHeader;
    leftColumnTableHeaderButton.title = '왼쪽 세로줄 강조';
    leftColumnTableHeaderButton.addEventListener('click', this._turnLeftColumnIntoTableHeader);
    toolbar.appendChild(leftColumnTableHeaderButton);

    const topRowTableHeaderButton = this._createFeatureButton('top-row-table-header');
    topRowTableHeaderButton.innerHTML = tableTopHeader;
    topRowTableHeaderButton.title = '첫 번째 가로줄 강조';
    topRowTableHeaderButton.addEventListener('click', this._turnTopRowIntoTableHeader)
    toolbar.appendChild(topRowTableHeaderButton);

    const removeAllTableHeadersButton = this._createFeatureButton('remove-all-table-headers');
    removeAllTableHeadersButton.innerHTML = tableNoHeader;
    removeAllTableHeadersButton.title = '모든 강조 제거';
    removeAllTableHeadersButton.addEventListener('click', this._removeAllHeadersInTable);
    toolbar.appendChild(removeAllTableHeadersButton);

    const deleteButton = this._createFeatureButton('delete');
    deleteButton.innerHTML = trashIcon;
    deleteButton.title = '테이블 삭제';
    deleteButton.addEventListener('click', this._deleteCurrentBlock);
    toolbar.appendChild(deleteButton);

    // TOBE: 입력중인 셀 글자 가운데 정렬 & 왼쪽 정렬
    // const textAlignCenterButton = this._createFeatureButton('align-text-center');
    // textAlignCenterButton.innerHTML = alignCenter;
    // textAlignCenterButton.title = '셀 글자 가운데 정렬';
    // toolbar.appendChild(textAlignCenterButton);

    this._attachToolbar(toolbar);
  }
  
  _attachToolbar = (toolbar) => {
    const table = this.table._table;

    setTimeout(() => {
      const editor = table.closest('div.tc-editor');
      editor.appendChild(toolbar);
      editor.style.marginBottom = '80px';
    }, 0);
  }

  _createFeatureButton = (className) => {
    const button = document.createElement('button');
    
    button.classList.add(...['table-toolbar__button', className]);

    return button;
  }

  _deleteCurrentBlock = (event) => {
    const index = this.api.blocks.getCurrentBlockIndex();

    this.api.blocks.delete(index);
  }

  _turnLeftColumnIntoTableHeader = (event) => {
    const table = this.table._table;
    
    for (let i = 0; i < table.rows.length; i++) {
      const firstCellInRow = table.rows[i].cells[0];
      const rowSpan = firstCellInRow.rowSpan;

      if (firstCellInRow.tagName === 'TH') {
        continue;
      }

      turnTdIntoTh(firstCellInRow);

      if (rowSpan > 1) {
        i += (rowSpan - 1);
      }
    }
  }

  _turnTopRowIntoTableHeader = (event) => {
    const table = this.table._table;

    for (let i = 0; i < table.rows[0].cells.length; i++) {
      const cell = table.rows[0].cells[i];
      const colSpan = cell.colSpan;
      
      if (cell.tagName === 'TH') {
        continue;
      }
      
      turnTdIntoTh(cell);

      if (colSpan > 1) {
        i += (colSpan - 1);
      }
    }
  }

  _removeAllHeadersInTable = (event) => {
    const table = this.table._table;
    const allThCells = table.querySelectorAll('th');

    allThCells.forEach((cell) => {
      turnThIntoTd(cell);
    })
  }
}
