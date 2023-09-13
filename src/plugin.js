const TableConstructor = require("./tableConstructor").TableConstructor
const svgIcon = require("./img/toolboxIcon.svg")
const borderIcon = require("./img/border.svg")

/**
 *  테이블 플러그인 클래스
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
    return true
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      br: true,
      mark: true,
    }
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
      title: "Table",
    }
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
    this.api = api
    this.readOnly = readOnly

    this.config = config
    this.api = api
    this.readOnly = readOnly

    this._tableConstructor = new TableConstructor(data, config, api, readOnly)

    this._CSS = {
      input: "tc-table__inp",
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    }

    this.borderActive = data.settings?.withBorder

    document.addEventListener('paste', (event) => {
      window.clipText = event.clipboardData.getData('text/html')
    })
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   * @public
   */
  render() {
    return this._tableConstructor.htmlElement
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLElement} toolsContent - Tool HTML element
   *
   * @returns {TableData} - saved data
   */
  save(toolsContent) {
    const table = toolsContent.querySelector("table")
    const colgroup = []
    const rows = []

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i]
      const rowData = []

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j]
        const data = {
          content: cell.querySelector("." + this._CSS.input).innerHTML,
          colspan: cell.colSpan,
          rowspan: cell.rowSpan,
          display: cell.style.display === "none" ? false : true,
          bgColor: cell.style.backgroundColor,
          isHeader: cell.tagName === "TH",
          alignment: cell.style.textAlign || 'left',
        }

        rowData.push(data)
      }

      rows.push(rowData)
    }

    table
        .querySelectorAll("col")
        .forEach((col) => {
          colgroup.push({
            span: col.span,
            width: col.style.width,
          })
        })

    return {
      rows,
      colgroup,
    }
  }

  /**
   * @private
   * @param {HTMLElement} input - input field
   * @returns {boolean}
   */
  _isEmpty(input) {
    return !input.textContent.trim()
  }

  toggleBorder = () => {
    this.borderActive = !this.borderActive
    this.toggleBorderButton.classList.toggle(this._CSS.settingsButtonActive, this.borderActive)
    this._tableConstructor._table._element.classList.toggle(
      this._tableConstructor._CSS.withBorder,
      this.borderActive
    )
  }

  /**
   * Create Block's settings block
   *
   * @returns {HTMLElement}
   */
  renderSettings() {
    const holder = document.createElement("DIV")

    /** Add border toggle */
    const toggleBorderButton = document.createElement("SPAN")

    toggleBorderButton.classList.add(this._CSS.settingsButton)

    /**
     * Highlight current level button
     */
    if (this.borderActive) {
      toggleBorderButton.classList.add(this._CSS.settingsButtonActive)
    }

    /**
     * Add SVG icon
     */
    toggleBorderButton.innerHTML = borderIcon

    /**
     * Save level to its button
     */
    toggleBorderButton.dataset.active = this.borderActive

    /**
     * Set up click handler
     */
    toggleBorderButton.addEventListener("click", () => {
      this.toggleBorder()
    })

    /**
     * Append settings button to holder
     */
    // holder.appendChild(toggleBorderButton);

    /**
     * Save settings buttons
     */
    this.toggleBorderButton = toggleBorderButton

    return holder
  }

  static get pasteConfig() {
    return { tags: ['TABLE', 'TR', 'TH', 'TD'] };
  }

  onPaste(event) {
    setTimeout(() => {
      const tableDraw = document.createElement('div');

      tableDraw.innerHTML = window.clipText;

      if (window.hasOwnProperty('clipText')) {
        const table = tableDraw.querySelector('table');

        /** Get all rows from the table */
        const rows = Array.from(table.querySelectorAll('tr'));

        let cellsLenght = 0;

        /** Generate a content matrix */
        const content = rows.map((row) => {
          /** Get cells from row */
          const cells = Array.from(row.querySelectorAll('th, td'))

          if (cells.length > cellsLenght) {
            cellsLenght = cells.length
          }

          /** Return cells content */
          return cells.map((cell) => {
            return {
              alignment: 'left',
              bgColor: cell.style.backgroundColor || '',
              colspan: cell.getAttribute('colspan') || 1,
              content: cell.innerText,
              display: true,
              isHeader: cell.tagName === 'TH',
              rowspan: 1,
            };
          });
        })
            .filter((row) => row.length)
            .map((row) => {
              if (row.length >= cellsLenght) {
                return row;
              }

              let colSpanTotal = 0;

              row.forEach((cell) => {
                colSpanTotal += cell.colspan;
              });

              if (colSpanTotal >= cellsLenght) {
                return row;
              }

              for (let i = row.length; i < cellsLenght; i++) {
                row.push({
                  alignment: 'left',
                  bgColor: '',
                  colspan: 1,
                  content: '',
                  display: true,
                  isHeader: false,
                  rowspan: 1,
                });
              }

              return row;
            })
            .map((row) => {
              let colSpanTotal = 0;

              row.forEach((cell) => {
                colSpanTotal += parseInt(cell.colspan);
              });

              if (row.length < colSpanTotal) {
                const append = colSpanTotal - row.length;

                for (let i = 0; i < append; i++) {
                  row.push({
                    alignment: 'left',
                    bgColor: '',
                    colspan: 1,
                    content: '',
                    display: false,
                    isHeader: false,
                    rowspan: 1,
                  });
                }
              }

              return row;
            })

        const colgroup = Array
            .from(table.querySelectorAll('col'))
            .map(() => {
              return {
                span: 1,
                width: '', // col.getAttribute('width') || '',
              }
            })

        if (! colgroup.length) {
          for (let i = 0; i < cellsLenght; i++) {
            colgroup.push({
              span: 1,
              width: '',
            });
          }
        }

        const newConstructor = new TableConstructor({
          colgroup: colgroup,
          rows: content
        }, this.config, this.api, this.readOnly)

        /** Update table block */
        this._tableConstructor._container.replaceWith(newConstructor.htmlElement)
        this._tableConstructor = newConstructor
      }
    }, 100)
  }

  stringToHtml(str) {
    let dom = document.createElement('div');
    dom.innerHTML = str;

    return dom;
  };
}

module.exports = Table
