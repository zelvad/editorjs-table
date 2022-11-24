import { create, getCoords, getSideByCoords } from './documentUtils';
import { Resize } from "./resize";
import { SelectLine, CSS as CSSSelectLine } from "./selectLine";
import { CreateLine } from "./createLine";
import { ImageUpload, CSS as imageUploadCSS } from "./imageUpload";
import './styles/table.scss';

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
    
    this.resize = new Resize(this);
    this.selectLine = new SelectLine(this);
    this.createLine = new CreateLine(this);
    this.imageUpload = new ImageUpload(this);
    
    this._element = this._createTableWrapper();
    this._table = this._element.querySelector('table');
    this.colgroup = this._table.querySelector('colgroup');

    if (!this.readOnly) {
      this._hangEvents();
    }
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
      if (x !== 0) {
        this.resize.createElem(cell);
      }
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
    this._numberOfColumns--;
    for (let i = 0; i < this._table.rows.length; i += 1) {
      this._table.rows[i].deleteCell(index);
    }
    
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
    this._numberOfRows--;
    this._table.rows[index].remove();
    this.updateButtons();
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
    cell.classList.add(CSS.cell);
    const content = this._createContentEditableArea();

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
      if (event.keyCode === 13) {
        this._pressedEnterInEditField(event);
        return;
      }

      if (event.shiftKey) {
        this._pressedShiftKey(event);
      }
    });

    this._table.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this._mouseDownOnCell(event);
      }
    });

    this._table.addEventListener('dblclick', (event) => {
      if (event.button === 0) {
        this._doubleClickCell(event);
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
    this._selectedCell = null;
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

  _doubleClickCell(event) {
    const cell = event.target.closest('td');
    cell.classList.add('selected');
  }

  _pressedShiftKey(event) {
    const table = this._table;
    const startCell = event.target.closest('td');
    const startRowIndex = startCell.parentNode.rowIndex;
    const startColIndex = startCell.cellIndex;

    const handleMouseDownOnCell = (event) => {
      if (event.target.closest('td')) {
        const targetCell = event.target.closest('td');
        const targetRowIndex = targetCell.parentNode.rowIndex;
        const targetColIndex = targetCell.cellIndex;

        if (startRowIndex === targetRowIndex) {
          // 이미 합쳐진 셀이 포함됐다면 실행을 멈춘다. (로직 수정 필요)
          if (Array.from(table.rows[startRowIndex].cells).some((cell) => cell.colSpan > 1 || cell.rowSpan > 1)) {
            return;
          }
          
          for (let i = startColIndex; i <= targetColIndex; i++) {
            table.rows[startRowIndex].cells[i].classList.add('selected');
          }

          return;
        }

        if (startColIndex === targetColIndex) {
          // 이미 합쳐진 셀이 포함됐다면 실행을 멈춘다.
          for (let i = startRowIndex; i <= targetRowIndex; i++) {
            const cell = table.rows[i].cells[startColIndex];

            if (cell.colSpan > 1 || cell.rowSpan > 1) return;
          }
          
          for (let i = startRowIndex; i <= targetRowIndex; i++) {
            table.rows[i].cells[startColIndex].classList.add('selected');
          }
        }
      }
    }

    this._table.addEventListener('mousedown', handleMouseDownOnCell, { once: true });
  }

  _changeCellBackgroundColor(event) {
    const table = this._table;
    const selectedCells = table.querySelectorAll('td.selected');
    const inputElement = document.createElement('input');
    const pointerX = event.clientX;
    const pointerY = event.clientY

    const handleColorChange = (event) => {
      const hex = event.target.value;

      selectedCells.forEach((cell) => {
        cell.style.backgroundColor = hex;
      })
    }

    const hideColorPicker = (event) => {
      if (event.target.tagName === 'INPUT') {
        return;
      }

      inputElement.remove();
      document.removeEventListener('click', hideColorPicker);
    }
    
    inputElement.type = 'color';
    inputElement.style.position = 'fixed';
    inputElement.style.top = pointerY + 'px';
    inputElement.style.left = pointerX + 'px';

    inputElement.addEventListener('input', handleColorChange);

    setTimeout(() => {
      document.addEventListener('click', hideColorPicker);
    }, 0);

    table.appendChild(inputElement);
  }

  _mergeCells() {
    const table = this._table;
    const everyCell = table.querySelectorAll('td');
    const selectedCells = Array.from(everyCell).filter((cell) => cell.classList.contains('selected'));
    
    const topLeftCell = selectedCells[0];
    const bottomRightCell = selectedCells[selectedCells.length - 1];
    
    const colSpan = bottomRightCell.cellIndex - topLeftCell.cellIndex + 1;
    const rowSpan = bottomRightCell.parentNode.rowIndex - topLeftCell.parentNode.rowIndex + 1;

    selectedCells.forEach((cell, i) => {
      // 첫 번째 셀의 colspan, rowspan 을 늘리고 나머지 셀을 삭제한다.
      if (i === 0) {
        cell.colSpan = colSpan;
        cell.rowSpan = rowSpan;
      } else {
        cell.remove();
      }
    });
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  _mouseDownOnCell(event) {
    if (event.target.closest('td')) {
      const table = this._table;
      const everyCell = table.querySelectorAll('td');

      const deselectEveryCell = () => {
        everyCell.forEach((cell) => {
          cell.classList.remove('selected');
        });
      }

      deselectEveryCell(everyCell);
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   * @menu 셀 합치기, 셀 배경색 변경하기
   */
  _showCustomContextMenuOnSelectedCells(event) {
    const contextMenu = document.createElement('div');
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    const hideContextMenu = (event) => {
      if (event.target.className !== 'context-menu') {
        contextMenu.remove();
        document.removeEventListener('click', hideContextMenu);
      }
    }

    const createMenuButton = (title, isActive = true) => {
      const menu = document.createElement('div');
    
      menu.textContent = title;
      menu.classList.add('context-menu__button');

      !isActive && menu.classList.add('deactivated');

      return menu;
    }

    const checkIfMergePossible = () => {
      const table = this._table;
      const everyCell = table.querySelectorAll('td');
      const selectedCells = Array.from(everyCell).filter((cell) => cell.classList.contains('selected'));

      // 이미 합쳐진 셀이 포함됐다면 실행을 멈춘다.
      if (selectedCells.some((cell) => cell.colSpan > 1 || cell.rowSpan > 1)) {
        return false;
      }

      return true;
    }

    contextMenu.style.position = 'fixed';
    contextMenu.style.top = pointerY + 'px';
    contextMenu.style.left = pointerX + 'px';
    contextMenu.classList.add('context-menu');

    const mergeCellsButton = createMenuButton('셀 합치기', checkIfMergePossible());
    const changeCellBackgroundColorButton = createMenuButton('셀 배경색 변경');
    
    this._table.appendChild(contextMenu);
    contextMenu.appendChild(mergeCellsButton);
    contextMenu.appendChild(changeCellBackgroundColorButton);

    document.addEventListener('click', hideContextMenu);
    mergeCellsButton.addEventListener('click', this._mergeCells.bind(this));
    changeCellBackgroundColorButton.addEventListener('click', this._changeCellBackgroundColor.bind(this));
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
