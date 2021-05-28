import {create} from "./documentUtils";
import './styles/image-upload.scss'

const IMAGE_UPLOAD_URL = '/upload_image'

export const CSS = {
  imageUploadButton: 'tc-table__image_upload_button',
  imageUploadButtonVisible: 'tc-table__image_upload_button_visible',
};

export class ImageUpload {
  constructor(table) {
    this.table = table;
    this.visible = false;
    this.cell = null;
    this.Button = null;
  }
  
  /**
   * @private
   * @returns {HTMLElement} - the create col/row
   */
  createElem = (wrapper) => {
    console.log('wrapper', wrapper)
    if (!wrapper.querySelector(`.${CSS.imageUploadButton}`)) {
      const fileInput = create('input', [], { type: 'file' });
      const button = create('button');
      button.innerText = 'Загрузить изображение'
  
      this.Button = create('div', [CSS.imageUploadButton], null, [
        fileInput,
        button,
      ]);
      fileInput.addEventListener('change', this.onChange);
      
      wrapper.appendChild(this.Button);
      return this.Button;
    }
  }
  
  onToggle = (visible) => {
    this.visible = visible;
    if (visible) {
      this.Button.classList.add(CSS.imageUploadButtonVisible);
      if (visible && this.table._selectedCell) {
        this.cell = this.table._selectedCell;
        this.Button.style.top = `${this.cell.offsetTop + this.cell.offsetHeight}px`;
        this.Button.style.left = `${this.cell.offsetLeft}px`;
      }
    } else {
      setTimeout(() =>{
        if (!this.table._selectedCell) {
          this.Button.classList.remove(CSS.imageUploadButtonVisible);
        }
      }, 200)
    }
  }
  
  onChange = async(e) => {
    this.image = e.target.files[0];
    await this.onUploadImage();
  }
  
  onUploadImage = async() => {
    const fd = new FormData()
    console.log('this.image', this.image)
    fd.append('upfile', this.image);
  
    const r = await fetch(IMAGE_UPLOAD_URL, {
      method: 'POST',
      body: fd,
    });
  
    console.log(r)
    
    return r;
  }
}
