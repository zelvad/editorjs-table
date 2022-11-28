import './styles/table-constructor.scss';
import { create, turnTdIntoTh } from './documentUtils';
import { Table } from './table';

/**
 * Entry point. Controls table and give API to user
 */
export class TableConstructor {
  /**
   * Creates
   * @param {TableData} data - previously saved data for insert in table
   * @param {object} config - configuration of table
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(data, config, api, readOnly) {
    this.readOnly = readOnly;
  
    this._CSS = {
      editor: readOnly ? 'tc-editor__readonly' : 'tc-editor',
      inputField: 'tc-table__inp',
      withBorder: 'tc-table__with_border'
    };
    
    /** creating table */

    try {
      this._table = new Table(readOnly, api);
      const size = this._resizeTable(data, config);
      this._fillTable(data, size);
    } catch (e) {
      console.log(e)
    }

    /** creating container around table */
    this._container = create('div', [this._CSS.editor, api.styles.block], null, [ this._table.htmlElement ]);
    
    /** Создаем кнопку для загрузки изображения */
    this._table.imageUpload.createElem(this._container);

    /** Activated elements */
    this._hoveredCell = null;
    this._hoveredCellSide = null;

    if (!this.readOnly) {
      this._hangEvents();
    }

    this.api = api
  }

  /**
   * returns html element of TableConstructor;
   * @return {HTMLElement}
   */
  get htmlElement() {
    return this._container;
  }

  /**
   * @private
   *
   *  Fill table data passed to the constructor
   * @param {TableData} data - data for insert in table
   * @param {{rows: number, cols: number}} size - contains number of rows and cols
   */
  _fillTable(data, size) {
    if (data.content !== undefined) {
      for (let i = 0; i < size.rows && i < data.content.length; i++) {
        for (let j = 0; j < size.cols && j < data.content[i].length; j++) {
          const content = data.content[i][j];
          const colSpan = data.colSpans[i][j];
          const rowSpan = data.rowSpans[i][j];
          const bgColor = data.backgroundColors[i][j];
          const isHeader = data.headers[i][j];
          const cell = this._table.body.rows[i].cells[j];

          cell.colSpan = colSpan;
          cell.rowSpan = rowSpan;
          cell.style.backgroundColor = bgColor;

          // get current cell and her editable part
          if (typeof content === 'string') {
            const input = cell.querySelector('.' + this._CSS.inputField);
            input.innerHTML = content;
          } else if (content?.type === 'image') {
            this._table.imageUpload.createImage(cell, content.src);
          }

          if (isHeader) {
            turnTdIntoTh(cell);
          }
        }
      }
    }
  }

  /**
   * @private
   *
   * resize to match config or transmitted data
   * @param {TableData} data - data for inserting to the table
   * @param {object} config - configuration of table
   * @param {number|string} config.rows - number of rows in configuration
   * @param {number|string} config.cols - number of cols in configuration
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  _resizeTable(data, config) {
    const isValidArray = Array.isArray(data.content);
    const isNotEmptyArray = isValidArray ? data.content.length : false;
    const contentRows = isValidArray ? data.content.length : undefined;
    const contentCols = isNotEmptyArray ? data.content[0].length : undefined;
    const parsedRows = Number.parseInt(config.rows);
    const parsedCols = Number.parseInt(config.cols);
    // value of config have to be positive number
    const configRows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : undefined;
    const configCols = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : undefined;
    const defaultRows = 3;
    const defaultCols = 2;
    const rows = contentRows || configRows || defaultRows;
    const cols = contentCols || configCols || defaultCols;

    for (let i = 0; i < rows; i++) {
      this._table.addRow(i);
    }
    for (let i = 0; i < cols; i++) {
      this._table.addColumn(i);
    }


    data.columnWidths?.forEach((width, i) => {
      if (this._table.colgroup.children[i]) {
        this._table.colgroup.children[i].style.width = `${width * 100}%`;
      }
    });

    this._table.htmlElement.classList.toggle(
      this._CSS.withBorder,
      true
    );
    
    return {
      rows: rows,
      cols: cols
    };
  }

  /**
   * @private
   *
   * hang necessary events
   */
  _hangEvents() {
    this._container.addEventListener('keydown', (event) => {
      this._containerKeydown(event);
    });
  }

  /**
   * @private
   *
   * detects button presses when editing a table's content
   * @param {KeyboardEvent} event
   */
  _containerKeydown(event) {
    if (event.keyCode === 13) {
      this._containerEnterPressed(event);
    }
  }

  /**
   * @private
   *
   * Check if the addition is initiated by the container and which side
   * @returns {number} - -1 for left or top; 0 for bottom or right; 1 if not container
   */
  _getHoveredSideOfContainer() {
    if (this._hoveredCell === this._container) {
      return this._isBottomOrRight() ? 0 : -1;
    }
    return 1;
  }

  /**
   * @private
   *
   * check if hovered cell side is bottom or right. (lefter in array of cells or rows than hovered cell)
   * @returns {boolean}
   */
  _isBottomOrRight() {
    return this._hoveredCellSide === 'bottom' || this._hoveredCellSide === 'right';
  }

  /**
   * @private
   *
   * 셀 내부에서 엔터키를 누르면 다음 줄로 포커스가 넘어간다
   * @param {KeyboardEvent} event
   */
  _containerEnterPressed(event) {
    if (event.shiftKey) {
      return;
    }

    const table = this._table._table;
    const currentCell = this._table.selectedCell.closest('td,th');
    const rowIndex = currentCell.parentNode.rowIndex;
    const rowSpan = currentCell.rowSpan;

    // 셀이 세로로 합쳐졌을때, 셀의 가장 아래쪽에 위치한 Row 의 Index 값.
    // 합쳐지지 않은 셀이라면, 셀이 위치한 Row 의 Index 값.
    const cellBottomRowIndex = rowIndex + (rowSpan - 1);

    // 더 이상 아래로 내려갈 수 없다면 취소한다
    if (table.querySelectorAll('tr').length === (cellBottomRowIndex + 1)) {
      return;
    }

    try {
      const nextRowSameIndexCell = table.rows[cellBottomRowIndex + 1].cells[currentCell.cellIndex].querySelector('div.tc-table__inp');

      nextRowSameIndexCell.focus();
    } catch (error) {
      const nextRowFirstIndexCell = table.rows[cellBottomRowIndex + 1].cells[0].querySelector('div.tc-table__inp');

      nextRowFirstIndexCell.focus();
    }
  }
}
