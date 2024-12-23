const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = {
  entry: './src/tailwind-home.tsx',
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
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'assets/[name].[hash:8].[ext]',
              publicPath: '/'
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new DotenvWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index-tailwind.html',
      publicPath: '/'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public'},
      ],
    }),
  ].filter(Boolean),
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'public'),
      },
      {
        directory: path.join(__dirname, 'build', 'frontend'),
      },
      
    ],
    historyApiFallback: {
      index: '/index-tailwind.html',
      rewrites: [
        { from: /^\/repertoire\/[0-9]+/, to: '/index-tailwind.html' }
      ]
    },
    compress: true,
    port: process.env.FRONT_PORT
  }
};
