const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './client/index.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './public/'),
    filename: '[name].bundle.js',
    // publicPath: '/quill/dist'
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    publicPath: '/public/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    })
  ]
}