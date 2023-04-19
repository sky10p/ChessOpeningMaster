const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

const path = require('path');

module.exports = {
  entry: './src/frontend/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build', 'frontend'),
    filename: 'bundle.js'
  },
  target: "web",
  resolve: {
    extensions: ['.tsx', '.ts', '.js', ".css"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ]
  },
  plugins: [
    new DotenvWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/frontend/index.html',
      publicPath: '/'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: path.join(__dirname, 'build', 'frontend'),
    },
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/repertoire\/[0-9]+/, to: '/index.html' }
      ]
    },
    compress: true,
    port: process.env.FRONT_PORT
  }
};
