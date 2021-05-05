const path = require('path');

module.exports = {
  entry: './src/plugin.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist/',
    library: 'Table',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader?removeSVGTagAttrs=false'
      }
    ]
  },
};