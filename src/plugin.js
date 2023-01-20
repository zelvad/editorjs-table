const TableConstructor = require("./tableConstructor").TableConstructor
const svgIcon = require("./img/toolboxIcon.svg")
const borderIcon = require("./img/border.svg")

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

    this._tableConstructor = new TableConstructor(data, config, api, readOnly)

    this._CSS = {
      input: "tc-table__inp",
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    }

    this.borderActive = data.settings?.withBorder
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
        }

        rowData.push(data)
      }

      rows.push(rowData)
    }

    table.querySelectorAll("col").forEach((col) => {
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
}

module.exports = Table
