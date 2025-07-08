const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const port = 8080

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist/_static'),
    filename: '_static/bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html', inject: 'body' }),
    new NodePolyfillPlugin({ additionalAliases: ['process'] }),
  ],
  devServer: {
    historyApiFallback: { index: '/index.html' },
    static: {
      directory: path.resolve(__dirname, 'assets'),
      publicPath: '/_static/assets',
    },
    hot: true, compress: false,
    server: { type: 'http' }, port, 
    allowedHosts: ['localhost'],
  },
  optimization: {
    usedExports: true,
  }
}
