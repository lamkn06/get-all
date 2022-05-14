const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',

  target: 'node',

  externals: [nodeExternals()], // Need this to avoid error when working with Express

  entry: {
    server: path.resolve(__dirname, '../server.js'),
  },

  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../build'),
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: 'babel-loader',
        exclude: ['/node_modules/', '/src/_icons'],
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(pdf|txt|xml|eot|ttf|woff|woff2|otf)$/,
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

  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
};
