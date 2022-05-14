const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = env => {
  return merge(common(env), {
    mode: 'development',

    devtool: 'inline-source-map',

    output: {
      path: path.resolve(__dirname, '../build'),
      filename: '[name].bundle.js',
      publicPath: '/',
    },

    devServer: {
      historyApiFallback: true,
      open: true,
      compress: true,
      hot: true,
      port: process.env.PORT || 9001,
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, '../.env.local'), // load this now instead of the ones in '.env'
        safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
        allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
        systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
        silent: true, // hide any errors
        defaults: false, // load '.env.defaults' as the default values if empty.}),
      }),
      new ESLintPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ],
  });
};
