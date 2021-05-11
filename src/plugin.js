const TableConstructor = require('./tableConstructor').TableConstructor;
const svgIcon = require('./img/toolboxIcon.svg');

const CSS = {
  input: 'tc-table__inp',
};

/**
 *  Tool for table's creating
 *
 *  @typedef {object} TableData - object with the data transferred to form a table
 *  @property {string[][]} content - two-dimensional array which contains table content
 */
class Table {
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: svgIcon,
      title: 'Table',
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {TableData} data — previously saved data
   * @param {object} config - user config for Tool
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    this._tableConstructor = new TableConstructor(data, config, api, readOnly);
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   * @public
   */
  render() {
    return this._tableConstructor.htmlElement;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLElement} toolsContent - Tool HTML element
   *
   * @returns {TableData} - saved data
   */
  save(toolsContent) {
    const table = toolsContent.querySelector('table');
    const data = [];
    const rows = table.rows;
    const sizes = [];
    const width = table.offsetWidth;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cols = Array.from(row.cells);
      const inputs = cols.map(cell => cell.querySelector('.' + CSS.input));
      // const isWorthless = inputs.every(this._isEmpty);
      
      // if (isWorthless) {
      //   continue;
      // }
      
      if (i === 0) {
        cols.forEach(c => {
          sizes.push(c.offsetWidth / width);
        })
      }
      
      data.push(inputs.map(input => input.innerHTML));
    }

    return {
      settings: { sizes },
      content: data,
    };
  }

  /**
   * @private
   * @param {HTMLElement} input - input field
   * @returns {boolean}
   */
  _isEmpty(input) {
    return !input.textContent.trim();
  }
}

module.exports = Table;
