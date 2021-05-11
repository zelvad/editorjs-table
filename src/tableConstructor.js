import './styles/table-constructor.scss';
import {create} from './documentUtils';
import {Table, CSS as TableCSS} from './table';

const CSS = {
  editor: 'tc-editor',
  toolBarHor: 'tc-toolbar--hor',
  toolBarVer: 'tc-toolbar--ver',
  inputField: 'tc-table__inp'
};

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

    /** creating table */

    try {
      this._table = new Table(readOnly);
      const size = this._resizeTable(data, config);
      this._fillTable(data, size);
    } catch (e) {
      console.log(e)
    }

    /** creating container around table */
    this._container = create('div', [CSS.editor, api.styles.block], null, [ this._table.htmlElement ]);

    /** Activated elements */
    this._hoveredCell = null;
    this._hoveredCellSide = null;

    if (!this.readOnly) {
      this._hangEvents();
    }
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
          // get current cell and her editable part
          const input = this._table.body.rows[i].cells[j].querySelector('.' + CSS.inputField);

          input.innerHTML = data.content[i][j];
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
    const { settings } = data;
    const defaultRows = 3;
    const defaultCols = 2;
    const rows = contentRows || configRows || defaultRows;
    const cols = contentCols || configCols || defaultCols;

    for (let i = 0; i < rows; i++) {
      this._table.addRow(i, rows);
    }
    for (let i = 0; i < cols; i++) {
      this._table.addColumn(i, cols);
    }
  
    if (settings && settings.sizes) {
      settings.sizes.forEach((size, i) => {
        if (this._table.body.rows[0].children[i]) {
          this._table.body.rows[0].children[i].style.width = `${size * 100}%`;
        }
      })
    }
    
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
    this._container.addEventListener('click', (event) => {
      this._clickToolbar(event);
    });

    this._container.addEventListener('keydown', (event) => {
      this._containerKeydown(event);
    });
  }

  /**
   * @private
   *
   * Checks elem is toolbar plus button
   * @param {HTMLElement} elem - element
   * @return {boolean}
   */
  _isToolbarPlus(elem) {
    if (Boolean(elem.closest('.' + TableCSS.addColumn))) return 0;
    if (Boolean(elem.closest('.' + TableCSS.addRow))) return 1;
    return -1;
  }

  /**
   * @private
   *
   * handling clicks on toolbars
   * @param {MouseEvent} e
   */
  _clickToolbar(e) {
    const index = this._isToolbarPlus(e.target);
    if (index === -1) {
      return;
    }
  
    if (e.target.closest(`.${TableCSS.addColumn}_end`) || e.target.closest(`.${TableCSS.addRow}_end`)) {
      e.target.remove();
    }
    
    if (index === 1) {
      this._addRow(e.target.dataset.y);
    } else {
      this._addColumn(e.target.dataset.x);
    }
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
   * Adds row in table
   * @private
   */
  _addRow(index) {
    this._table.addRow(Number(index),  this._table.totalRows + 1);
  }

  /**
   * @private
   *
   * Adds column in table
   */
  _addColumn(index) {
    this._table.addColumn(Number(index), this._table.totalColumns + 1);
  }

  /**
   * @private
   *
   * if "cntrl + Eneter" is pressed then create new line under current and focus it
   * @param {KeyboardEvent} event
   */
  _containerEnterPressed(event) {
    if (!(this._table.selectedCell !== null && !event.shiftKey)) {
      return;
    }
    const indicativeRow = this._table.selectedCell.closest('TR');
    let index = this._getHoveredSideOfContainer();

    if (index === 1) {
      index = indicativeRow.sectionRowIndex + 1;
    }
    const newstr = this._table.addRow(index);

    newstr.cells[0].click();
  }
}
