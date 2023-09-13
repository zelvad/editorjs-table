![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Table tool

Resizable Table Block for the [Editor.js](https://editorjs.io).

![](https://user-images.githubusercontent.com/108341074/213103362-1f730708-94b8-4504-8c0f-84ce52c410af.png)

## Additional functions

- Import from Spreadsheets
- Text alignment

## Installation

### Install via NPM or Yarn

Get the package

```shell
npm i --save-dev @everzel/editorjs-table
```

or

```shell
yarn add @everzel/editorjs-table --dev
```

Include module in your application

```javascript
const Table = require("@everzel/editorjs-table")
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
        rows: 3,
        cols: 3,
        colors: [
          "#ffffff",
          "#e0ebfd",
          "#eafbfe",
          "#e8fbf0",
          "#fefae8",
          "#fcece7",
          "#e9e6fd",
          "#f4f5f7",
          "#b9d4fb",
          "#c1f3fd",
          "#bbf3d3",
          "#fcf0ba",
          "#f5c0b0",
          "#beb7ee",
          "#b4bac4",
          "#5f9af8",
          "#93dfef",
          "#7cd5a7",
          "#f6c544",
          "#f0957a",
          "#978ed4",
        ]
      },
    },
    i18n: {
      messages: {
        tools: {
          table: {
            "Merge Cells": "셀 합치기",
            "Divide Cell": "셀 나누기",
            "Insert Column On Right": "오른쪽에 열 삽입",
            "Insert Row Below": "아래에 행 삽입",
            "Remove Column": "열(↕) 삭제",
            "Remove Row": "행(↔) 삭제",
            "Cell Color": "셀 배경",
            "Header Row": "헤더 행",
            "Header Column": "헤더 열",
          },
        },
      },
    },
  },

  ...
});
```

## Config Params

| Field  | Type       | Description                                          |
| ------ | ---------- | ---------------------------------------------------- |
| rows   | `number`   | initial number of rows. by default `2`               |
| cols   | `number`   | initial number of columns. by default `2`            |
| colors | `string[]` | cell background color options. default preset exists |

## Output data

This Tool returns `data` with following format

| Field    | Type       | Description                                    |
| -------- | ---------- | ---------------------------------------------- |
| rows     | `object[]` | array of objects containing data for each cell |
| colgroup | `object[]` | array of objects containing data for each col  |

```json
{
  "type": "table",
  "data": {
    "rows": [
      [
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        },
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        }
      ],
      [
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        },
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        }
      ],
      [
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        },
        {
          "content": "",
          "colspan": 1,
          "rowspan": 1,
          "display": true,
          "bgColor": "",
          "isHeader": false
        }
      ]
    ],
    "colgroup": [
      {
        "span": 1,
        "width": ""
      },
      {
        "span": 1,
        "width": ""
      }
    ]
  }
}
```
