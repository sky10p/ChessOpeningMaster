const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/frontend/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build', 'frontend'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/frontend/index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'build', 'frontend'),
    },
    compress: true,
    port: 9000
  }
};
