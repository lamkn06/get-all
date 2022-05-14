const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
// const SitemapPlugin = require('sitemap-webpack-plugin').default;

module.exports = () => {
  return merge(common('production'), {
    mode: 'production',
    devServer: {
      historyApiFallback: true,
    },

    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, '../build'),
      publicPath: '/',
    },

    optimization: {
      minimize: true,
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    plugins: [
      new Dotenv(),
      new CleanWebpackPlugin(),

      new HtmlWebpackPlugin({
        inject: true,
        title: 'GetAll',
        template: path.join(__dirname, '../src/index.ejs'),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    ],
  });
};
