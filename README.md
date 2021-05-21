![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Table tool
Resizable Table Block for the [Editor.js](https://editorjs.io).

![](https://res.cloudinary.com/ddulqhyfu/image/upload/v1621586778/github/editorjs-resizable-table-1.png)

## Installation

### Install via NPM or Yarn

Get the package

```shell
npm i --save-dev @8ui/editorjs-resizable-table
```
or
```shell
yarn add @8ui/editorjs-resizable-table --dev
```

Include module in your application

```javascript
const Table = require('@8ui/editorjs-resizable-table');
```

### Upload to your project's source dir
1. Download folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

## Usage
Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...
    table: {
      class: Table,
    }
  }
  
  ...
});
```

Or init Table Tool with additional settings

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
  },
  
  ...
});
```

## Config Params

| Field              | Type     | Description                              |
| ------------------ | -------- | ---------------------------------------- |
| rows               | `number` | initial number of rows. by default `2`   |
| cols               | `number` | initial number of columns. by default `2`|

## Output data
This Tool returns `data` with following format

| Field     | Type         | Description                               |
| --------- | ------------ | ----------------------------------------- |
| content   | `string[][]` | two-dimensional array with table contents |

```json
{
    "type" : "table",
    "data" : {
        "content" : [ ["Kine", "1 pcs", "100$"], ["Pigs", "3 pcs", "200$"], ["Chickens", "12 pcs", "150$"] ],
        "settings": {
          "sizes": [0.5, 0.25, 0.25]
        }
    }
}
```
