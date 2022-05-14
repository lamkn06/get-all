/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = env => {
  return {
    mode: 'development',
    entry: {
      main: path.join(__dirname, '../src/index.tsx'),
    },

    resolve: {
      modules: ['src', 'node_modules'],
      extensions: ['.js', '.ts', '.tsx', '.json', '.d.ts'],
      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.js', '.json', '.ts', '.tsx'],
        }),
      ],
    },

    target: 'web',

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          use: ['babel-loader', 'ts-loader'],
          exclude: ['/node_modules/'],
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'sass-loader',
            {
              loader: 'sass-resources-loader',
              options: {
                resources: [path.resolve('src/assets/styles/init.scss')],
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        },
        {
          test: /\.(pdf|txt|xml)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        },
        {
          test: /\.svg$/,
          use: 'svg-url-loader',
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        title: 'GetAll',
        template: path.join(__dirname, '../src/index.ejs'),
      }),
    ],
  };
};
