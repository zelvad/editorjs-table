const path = require('path');
const multer = require('multer');
const uploadImage = require('./node/uploadImage');

const upload = multer({
  dest: __dirname + '/uploads/'
})

module.exports = {
  entry: './src/plugin.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist/',
    library: 'Table',
    libraryTarget: 'umd'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    before: (app, server) => {
      app.post('/upload_image', upload.array('upfile'), uploadImage);
    }
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
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader?removeSVGTagAttrs=false'
      }
    ]
  },
};