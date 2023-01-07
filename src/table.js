import { create, getCoords, getSideByCoords } from './documentUtils';
import { Resize } from "./resize";
import { SelectLine, CSS as CSSSelectLine } from "./selectLine";
import { CreateLine } from "./createLine";
import { ImageUpload, CSS as imageUploadCSS } from "./imageUpload";
import './styles/table.scss';
import { CellMenu, CSS as CellMenuCSS } from './cellMenu';

export const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  container: 'tc-table__container',
  containerReadOnly: 'tc-table__container_readonly',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area',
  addColumn: 'tc-table__add_column',
  addRow: 'tc-table__add_row',
  addColumnButton: 'tc-table__add_column_button',
  addRowButton: 'tc-table__add_row_button',
};

/**
 * Generates and manages _table contents.
 */
export class Table {
  /**
   * Creates
   *
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(readOnly) {
    this.readOnly = readOnly;
    this._numberOfColumns = 0;
    this._numberOfRows = 0;
    
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector('table');
    this.colgroup = this._table.querySelector('colgroup');
    this.selectedRows = [];
    this.selectedCols = [];
    
    this.resize = new Resize(this);
    this.selectLine = new SelectLine(this);
    this.createLine = new CreateLine(this);
    this.imageUpload = new ImageUpload(this);
    this.cellMenu = new CellMenu(this);
    
    this._table.appendChild(this.cellMenu.container);
    this._table.appendChild(this.cellMenu.colorPalette);

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  deselectCells() {
    const everyCell = this._table.querySelectorAll('td');
    everyCell.forEach((cell) => {
      cell.classList.remove('selected');
    });
  }
  
  columnSizeReCalc() {
    const cols = this.colgroup.children;
    for (let i = 0; i < cols.length; i += 1) {
      cols[i].style.width = `${100 / cols.length}%`;
    }
  }
  
  fillButtons = (cell, x, y) => {
    // column
    if (y === 0) {
      this.createLine.createElem(cell);
    }
    
    if (x !== 0) {
      // 여기서 너비조절 막대기 생성하는 중.
      this.resize.createElem(cell);
    }

    // select line button
    if (x === 0 || y === 0) {
      this.selectLine.createElem(cell, Number(x === 0));
      if (x === 0 && y === 0) {
        this.selectLine.createElem(cell);
      }
    }
  
    // row
    if (x === 0) {
      this.createLine.createElem(cell, 1);
    }
  }
  
  updateButtons = () => {
    for (let i = 0; i < this._table.rows.length; i += 1) {
      const row = this._table.rows[i];
  
      for (let r = 0; r < row.children.length; r += 1) {
        const cell = row.children[r];
        this.fillButtons(cell, r, i)
      }
    }
  }
  
  removeButtons = (direction = 0) => {
    const arr = [
      [CSS.addColumn, CSSSelectLine.selectLineCol],
      [CSS.addRow, CSSSelectLine.selectLineRow]
    ]
    arr[direction].forEach((className) => {
      const elem1 = this._table.querySelectorAll(`.${className}`)
      for (let i = 0; i < elem1.length; i += 1) {
        elem1[i].remove();
      }
    })
  }
  
  insertCol(index) {
    this.colgroup.insertBefore(create('col', [], { span: 1 }), this.colgroup.children[index]);
  }
  
  removeCol(index) {
    this.body.querySelector('colgroup').children[index].remove();
  }

  /**
   * Add column in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  addColumn(index = -1) {
    this._numberOfColumns++;
    /** Add cell in each row */
    const rows = this._table.rows;
  
    if (index === 0) {
      this.removeButtons(1);
    }

    this.insertCol(index)
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(index);
      cell.colSpan = 1;
      cell.rowSpan = 1;
      this._fillCell(cell);
    }
    if (!this.readOnly) {
      this.columnSizeReCalc();
      this.updateButtons();
    }
  };
  
  removeColumn(index) {
    const table = this._table;

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const cellInColumn = row.cells[index];

      // 현재 셀이 합쳐진 셀의 일부라면 왼쪽으로 탐색하며 합쳐진 셀의 본체를 찾습니다.
      // 본체를 찾았다면 본체의 colSpan 을 1 깎고 반복문을 종료합니다.
      if (cellInColumn.style.display === 'none') {
        for (let j = index - 1; j >= 0; j--) {
          const leftCell = row.cells[j];

          if (leftCell.colSpan > 1) {
            leftCell.colSpan -= 1;
            break;
          }
        }
      }

      // 현재 셀이 합쳐진 셀의 본체 혹은 일부라면, 오른쪽으로 탐색하며 본체에 소속된 셀들을 해방합니다.
      // 현재 셀이 합쳐진 셀의 본체 혹은 일부가 아니라면, 반복문을 종료합니다.
      if (cellInColumn.style.display === 'none' || cellInColumn.colSpan > 1) {
        for (let j = index + 1; j < row.cells.length; j++) {
          const rightCell = row.cells[j];

          if (rightCell.style.display !== 'none') {
            break;
          }

          rightCell.style.removeProperty('display');
          rightCell.colSpan = 1;
          rightCell.rowSpan = 1;
        }
      }

      this._table.rows[i].deleteCell(index);
    }

    this._numberOfColumns--;
    this._removeInvisibleRows()
    
    if (!this.readOnly) {
      this.removeCol(index);
      this.columnSizeReCalc();
      this.updateButtons();
    }
  }

  /**
   * Add row in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   * @returns {HTMLElement} row
   */
  addRow(index = -1) {
    this._numberOfRows++;
    const row = this._table.insertRow(index);

    if (index === 0) {
      this.removeButtons(0);
    }
    
    this._fillRow(row, index);
    this.updateButtons();
    return row;
  };
  
  removeRow(index) {
    const table = this._table;
    const selectedRow = table.rows[index];
    
    for (let i = 0; i < selectedRow.cells.length; i++) {
      const cell = selectedRow.cells[i];

      // 현재 셀이 합쳐진 셀의 본체라면, 아래로 탐색하며 소속된 셀을 전부 해방합니다.
      // 같은 줄에 소속된 셀이 있다면 삭제될 것이니 건너뜁니다.
      if (cell.rowSpan > 1) {
        for (let j = index + 1; j < table.rows.length; j++) {
          for (let k = i; k < i + cell.colSpan; k++) {
            const cellBelow = table.rows[j].cells[k];
  
            cellBelow.style.removeProperty('display');
            cellBelow.colSpan = 1;
            cellBelow.rowSpan = 1;
          }
        }

      }

      if (cell.colSpan > 1) {
        i += cell.colSpan;
      }

      // 현재 셀이 합쳐진 셀의 일부라면 위로 탐색하며 합쳐진 셀의 본체를 찾습니다.
      // 본체를 찾았다면 본체의 rowSpan 을 1 깎고 반복문을 종료합니다.
      if (cell.style.display === 'none') {
        for (let j = index - 1; j >= 0; j--) {
          const upperRow = table.rows[j];
          const cellInUpperRow = upperRow.cells[i];

          if (cellInUpperRow.rowSpan > 1) {
            cellInUpperRow.rowSpan -= 1;
            break;
          }

          if (cellInUpperRow.style.display !== 'none') {
            break;
          }
        }
      }
    }
    
    this._numberOfRows--;
    table.rows[index].remove();
    this.updateButtons();
  }

  mergeCells() {
    const table = this._table;
    const everyCell = table.querySelectorAll('td')
    const selectedCells = Array.from(everyCell).filter((cell) => cell.classList.contains('selected'));
    
    const topLeftCell = selectedCells[0];
    const bottomRightCell = selectedCells[selectedCells.length - 1];

    const colSpan = bottomRightCell.cellIndex - topLeftCell.cellIndex + 1;
    const rowSpan = bottomRightCell.parentNode.rowIndex - topLeftCell.parentNode.rowIndex + 1;

    selectedCells.forEach((cell, i) => {
      // 첫 번째 셀의 colspan, rowspan 을 늘리고 나머지 셀을 숨긴다.
      if (i === 0) {
        cell.colSpan = colSpan;
        cell.rowSpan = rowSpan;
      } else {
        cell.colSpan = 1;
        cell.rowSpan = 1;
        cell.style.display = 'none';
      }
    });
    
    this._removeInvisibleRows();
    // remove invisible columns?
  }

  checkIfMergePossible() {
    const table = this._table;

    let everySelectedCells = 0;
    let visibleSelectedCells = 0;

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        
        if (cell.classList.contains('selected')) {            
          everySelectedCells += 1;

          if (cell.style.display !== 'none') {
            visibleSelectedCells += (cell.colSpan * cell.rowSpan)
          }
        }
      }
    }
    
    return everySelectedCells === visibleSelectedCells
  }
  
  /**
   * get html element of table
   *
   * @returns {HTMLElement}
   */
  get htmlElement() {
    return this._element;
  }

  /**
   * get real table tag
   *
   * @returns {HTMLElement}
   */
  get body() {
    return this._table;
  }

  /**
   * returns selected/editable cell
   *
   * @returns {HTMLElement}
   */
  get selectedCell() {
    return this._selectedCell;
  }
  
  get withBorder() {
    return
  }

  /**
   * 가로줄에 있는 모든 셀이 display="none" 이 되는 경우에 해당 Row 를 삭제한다.
   * 
   * @returns 위 조건에 해당하는 Row 의 갯수를 반환한다.
   */
  _removeInvisibleRows() {
    const table = this._table;
    const invisibleRows = [];

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const isEveryCellInvisible = Array.from(row.cells).every((cell) => cell.style.display === 'none');

      if (isEveryCellInvisible) {
        invisibleRows.push(i);
      }
    }

    invisibleRows.forEach((index, i) => {
      this.removeRow(index - i);
    });

    // 테이블의 row 가 하나로 줄어든다면 모든 셀의 rowSpan 을 1 로 보정합니다.
    if (table.rows.length === 1) {
      for (let i = 0; i < table.rows[0].cells.length; i++) {
        const cell = table.rows[0].cells[i];

        cell.rowSpan = 1;
      }
    }

    return invisibleRows.length;
  }

  /**
   * @private
   * @returns {HTMLElement} tbody - where rows will be
   */
  _createTableWrapper() {
    const className = this.readOnly ? CSS.containerReadOnly : CSS.container;
    const wrapper = create('div', [ className ], null, [
      create('div', [ CSS.wrapper ], null, [
        create('table', [ CSS.table ], null, [
          create('colgroup'),
          create('tbody'),
        ])
      ]),
    ]);
    
    if (!this.readOnly) {
      const addRowButton = create('div', [ CSS.addRowButton ]);
      const addColumnButton = create('div', [ CSS.addColumnButton ]);
  
      addRowButton.addEventListener('click', () =>
          this.addColumn(this._numberOfColumns),
        true
      );
      addColumnButton.addEventListener('click', () =>
          this.addRow(this._numberOfRows),
        true
      );
      
      wrapper.appendChild(addRowButton)
      wrapper.appendChild(addColumnButton)
    }
    
    return wrapper;
  }

  /**
   * @private
   * @returns {HTMLElement} - the area
   */
  _createContentEditableArea() {
    return create('div', [ CSS.inputField ], { contenteditable: !this.readOnly });
  }

  /**
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell) {
    const content = this._createContentEditableArea();
    
    this.cellMenu.createElem(cell);
    cell.classList.add(CSS.cell);
    cell.appendChild(create('div', [ CSS.area ], null, [ content ]));
  }

  /**
   * @private
   * @param row = the empty row
   */
  _fillRow(row) {
    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell();

      this._fillCell(cell);
    }
  }

  /**
   * @private
   */
  _hangEvents() {
    this._table.addEventListener('focus', (event) => {
      this._focusEditField(event);
    }, true);

    this._table.addEventListener('blur', (event) => {
      this._blurEditField(event);
    }, true);

    this._table.addEventListener('keydown', (event) => {
      this._pressedEnterInEditField(event);
    });

    this._table.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this._mouseDownOnCell(event);
      }
    });

    this._table.addEventListener('mouseover', (event) => {
      this._mouseEnterInDetectArea(event);
      event.stopPropagation();
    }, true);

    this._table.addEventListener('contextmenu', (event) => {
      if (event.target.closest('td') && event.target.closest('td').className.includes('selected')) {
        event.preventDefault();
        this._showCustomContextMenuOnSelectedCells(event);
        return false;
      }
    });
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _focusEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }

    this._selectedCell = event.target.closest('.' + CSS.cell);
    
    const optionButton = this.selectedCell.querySelector('.' + CellMenuCSS.openCellMenuButton)
    
    optionButton.style.visibility = 'visible';
    // this.imageUpload.onToggle(true);
  }

  /**
   * @private
   * @param {FocusEvent} event
   */
  _blurEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }

    const lastSelectedCell = event.target.closest('.' + CSS.cell);
    const optionButton = lastSelectedCell.querySelector('.' + CellMenuCSS.openCellMenuButton)

    optionButton.style.visibility = 'hidden';
    
    // this.imageUpload.onToggle(false);
  }

  /**
   * @private
   * @param {KeyboardEvent} event
   */
  _pressedEnterInEditField(event) {
    if (!event.target.classList.contains(CSS.inputField)) {
      return;
    }
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseDownOnCell(event) {
    if (event.target.closest('.' + CellMenuCSS.openCellMenuButton)) {
      return;
    }

    if (event.target.closest('td')) {
      const table = this._table
      const cell = event.target.closest('td');
      const startRowIndex = cell.parentNode.rowIndex;
      const startColIndex = cell.cellIndex;
      const everyCell = table.querySelectorAll('td');
      let currentCell = cell;
      this.selectedRows = [];
      this.selectedCols = [];

      const handleMouseMove = (event) => {
        const elementBelowMousePointer = document.elementFromPoint(event.clientX, event.clientY);
        const cellBelowMousePointer = elementBelowMousePointer.closest('td');
        const currentRowIndex = cellBelowMousePointer.parentNode.rowIndex;
        const currentColIndex = cellBelowMousePointer.cellIndex;
        
        if (currentCell !== cellBelowMousePointer) {
          this.deselectCells();
          selectCells(currentRowIndex, currentColIndex);
          cellBelowMousePointer.querySelector('.' + CSS.inputField).focus();

          currentCell = cellBelowMousePointer;
        }
      }

      const handleMouseUp = (event) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      const selectCells = (currentRowIndex, currentColIndex) => {
        const currentCell = table.rows[currentRowIndex].cells[currentColIndex];
        const isLastCellMerged = currentCell.colSpan > 1 || currentCell.rowSpan > 1;
        let additionalRow = 0;
        let additionalCol = 0;
        this.selectedRows = [];
        this.selectedCols = [];

        if (isLastCellMerged) {
          additionalRow += (currentCell.rowSpan - 1);
          additionalCol += (currentCell.colSpan - 1);
        }

        for (let i = startRowIndex; i <= currentRowIndex + additionalRow; i++) {
          const cellsInRow = table.rows[i].cells;
          
          for (let j = startColIndex; j <= currentColIndex + additionalCol; j++) {
            const cell = cellsInRow[j];
            
            cell.classList.add('selected');
          }
  
          this.selectedRows.push(i);
        }

        for (let i = startColIndex; i <= currentColIndex + additionalCol; i++) {
          this.selectedCols.push(i);
        }
      }

      this.deselectCells();
      this.cellMenu.hideCellMenu();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseEnterInDetectArea(event) {
    if (!event.target.classList.contains(CSS.area)) {
      return;
    }

    const coordsCell = getCoords(event.target.closest('TD'));
    const side = getSideByCoords(coordsCell, event.pageX, event.pageY);

    event.target.dispatchEvent(new CustomEvent('mouseInActivatingArea', {
      detail: {
        side: side
      },
      bubbles: true
    }));
  }
}
