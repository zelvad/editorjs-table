import { create, getCoords, getSideByCoords } from './documentUtils';
import { Resize } from "./resize";
import './styles/table.scss';

const CSS = {
  table: 'tc-table',
  inputField: 'tc-table__inp',
  cell: 'tc-table__cell',
  container: 'tc-table__container',
  wrapper: 'tc-table__wrap',
  area: 'tc-table__area',
  addColumn: 'tc-table__add_column',
  addRow: 'tc-table__add_row',
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
    this.totalColumns = 0;
    this.totalRows = 0;
    this.resize = new Resize(this._table);

    if (!this.readOnly) {
      this._hangEvents();
    }
  }

  /**
   * Add column in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   */
  addColumn(index = -1, totalColumns) {
    this._numberOfColumns++;
    this.totalColumns = totalColumns;
    /** Add cell in each row */
    const rows = this._table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(index);

      this._fillCell(cell, index, i);
    }
  };

  /**
   * Add row in table on index place
   *
   * @param {number} index - number in the array of columns, where new column to insert,-1 if insert at the end
   * @returns {HTMLElement} row
   */
  addRow(index = -1, totalRows) {
    this.totalRows = totalRows;
    this._numberOfRows++;
    const row = this._table.insertRow(index);

    this._fillRow(row, index);

    return row;
  };

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

  /**
   * @private
   * @returns {HTMLElement} tbody - where rows will be
   */
  _createTableWrapper() {
    return create('div', [ CSS.container ], null, [
      create('div', [ CSS.wrapper ], null, [ create('table', [ CSS.table ]) ])
    ]);
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
   * @returns {HTMLElement} - the create col/row
   */
  createAddButton(cell, classNames) {
    cell.appendChild(create('div', classNames, null, [
      create('div'),
      create('div')
    ]));
  }

  /**
   * @private
   * @param {HTMLElement} cell - empty cell
   */
  _fillCell(cell, x, y) {
    cell.classList.add(CSS.cell);
    const content = this._createContentEditableArea();

    cell.appendChild(create('div', [ CSS.area ], null, [ content ]));

    // column
    if (y === 0) {
      this.createAddButton(cell, [ CSS.addColumn ]);
      if (x !== 0) {
        const resizeElem = this.resize.createElem(x);
        cell.appendChild(resizeElem);
      }
    }

    // row
    if (x === 0) {
      this.createAddButton(cell, [ CSS.addRow ]);
    }

    console.log('this.totalColumns', cell, x, y);
    const endColumn = this.totalColumns === x + 1 && y === 0;
    if (endColumn) {
      this.createAddButton(cell, [CSS.addColumn, `${CSS.addColumn}_end`]);
    }
    const endRow = this.totalRows === y + 1 && x === 0;
    if (endRow) {
      this.createAddButton(cell, [CSS.addRow, `${CSS.addRow}_end`]);
    }
  }

  /**
   * @private
   * @param row = the empty row
   */
  _fillRow(row, index) {
    for (let i = 0; i < this._numberOfColumns; i++) {
      const cell = row.insertCell();

      this._fillCell(cell, i, index);
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

    this._table.addEventListener('click', (event) => {
      this._clickedOnCell(event);
    });

    this._table.addEventListener('mouseover', (event) => {
      this._mouseEnterInDetectArea(event);
      event.stopPropagation();
    }, true);
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
  _clickedOnCell(event) {
    if (!event.target.classList.contains(CSS.cell)) {
      return;
    }
    const content = event.target.querySelector('.' + CSS.inputField);

    content.focus();
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
