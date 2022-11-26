import trashIcon from './img/trash.svg';

export class Toolbar {
  constructor(table, api) {
    this.table = table;
    this.api = api;
  }

  createToolbar() {
    const table = this.table._table;
    
    const toolbar = document.createElement('div');
    toolbar.classList.add('table-toolbar');

    const deleteButton = this._createFeatureButton('delete');
    deleteButton.innerHTML = trashIcon;
    deleteButton.title = '테이블 삭제';
    deleteButton.addEventListener('click', this._deleteCurrentBlock);
    toolbar.appendChild(deleteButton);

    setTimeout(() => {
      const editor = table.closest('div.tc-editor');
      editor.appendChild(toolbar);
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
}
