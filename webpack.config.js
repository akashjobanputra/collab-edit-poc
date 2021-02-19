const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

if (process.env.NODE_ENV !== 'production') { 
  require('dotenv').config()
}

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './client/index.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './public/'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    clientLogLevel: 'debug',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    }),
    new webpack.DefinePlugin({
      "process.env.YJS_SERVER": JSON.stringify(process.env.YJS_SERVER),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
  ]
}