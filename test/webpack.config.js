const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const ProgressEndCompressPlugin = require('../index.js');
const ProgressEndCompressPlugin = require('progress-end-compress-webpack-plugin');

const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().length == 2 ? now.getMonth() + 1 : '0' + (now.getMonth() + 1).toString();
const day = (now.getDate() + 1).toString().length == 2 ? now.getDate() : '0' + now.getDate();
const hour = now.getHours().toString().length == 2 ? now.getHours() : '0' + now.getHours().toString();
const minutes = now.getMinutes().toString().length == 2 ? now.getMinutes() : '0' + now.getMinutes().toString();

const nowString = (year + '') + month + day + hour + minutes;

module.exports = {
  entry: {
    main: './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: 'http://localhost:3444/assets/'
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.json', '.js', '.jsx']
  },
  devServer: {
    publicPath: 'http://localhost:3444/assets/',
    contentBase: path.resolve(__dirname, './'),
    host: 'localhost',
    port: 3444,
    open: false,
    compress: false,
    hot: false,
    inline: false,
    lazy: false,
    historyApiFallback: true,
    stats: {
      assets: true,
      chunks: false,
      colors: true,
      version: false,
      hash: true,
      timings: true,
      chunkModules: false,
      children: false,
      modules: false
    }
  },
  plugins: [
    new CleanWebpackPlugin(fs.readdirSync(path.resolve(__dirname)).filter(function(i) {
      return /dist/.test(i)
    })),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NormalModuleReplacementPlugin(/ByteBuffer/, function(data) {
      data.request = data.request.replace("ByteBuffer", "bytebuffer")
    }),
    new webpack.ContextReplacementPlugin(/protobufjs.dist/, /$^/),
    new ProgressEndCompressPlugin({
      compressDir: {
        paths: [{
          sourceDir: path.resolve(__dirname, 'dist'),
          targetDir: path.resolve(__dirname),
          name: 'dist',
          hash: nowString
        }]
      },
      // sshConfig: {
      //   host: '192.168.3.116',
      //   username: 'root',
      //   port: 22,
      //   password: 'Reedsec888',
      //   romotePath: '/home/reedsec/web/web-api-c2b/web-view/',
      //   replaceDirectly: false
      // }
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      inject: true
    })
  ],
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    module: 'empty'
  }
};
