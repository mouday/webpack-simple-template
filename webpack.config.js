'use strict'

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

// 检查环境
function is_dev() {
  return process.env.NODE_ENV === 'development'
}

// css 公共 loaders
const cssLoaders = [
  is_dev() ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
  'css-loader',
  'postcss-loader',
]

module.exports = {
  // 打包入口
  entry: './src/index.js',

  // 指定输出地址及打包出来的文件名
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:6].js',
    clean: true, // 每次构建前清理 /dist 文件夹
    // futureEmitAssets: false
    // 自定义资源文件名
    assetModuleFilename: 'images/[name].[hash:6][ext][query]',
  },

  // 配置引入别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 开发
  devServer: {
    port: '8383',
    open: true,
    // contentBase: 'dist',
  },

  //启用source-map方便调试
  devtool: is_dev() ? 'eval-cheap-module-source-map' : false,

  module: {
    rules: [
      // css
      {
        test: /\.css$/i,
        use: cssLoaders,
      },

      // less
      {
        test: /\.less$/,
        use: [
          ...cssLoaders,
          'less-loader',
          // 引入全局变量
          {
            loader: 'style-resources-loader',
            options: {
              patterns: ['src/style/variables.less'],
            },
          },
        ],
      },

      // sass
      {
        test: /\.scss$/,
        use: [...cssLoaders, 'sass-loader'],
      },

      // 图片 webpack4
      // {
      //   test: /\.(jpg|png|gif|jpeg)$/,
      //   use: [
      //     {
      //       loader: 'url-loader',
      //       options: {
      //         // 如果图片大小小于这个值，就会被打包为base64格式
      //         limit: 10 * 1000, // 10 kb
      //         name: 'imgs/[name].[hash].[ext]',
      //       },
      //     },
      //   ],
      // },

      // js 需要进行语法转换
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
        ],
      },

      // vue
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },

      // 处理资源文件 webpack5
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        // 默认: 小于 8kb 的文件，将会视为 inline 模块类型，否则会被视为 resource 模块类型。
        type: 'asset',
      },
      // 加载 fonts 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    // html模板
    new HtmlWebpackPlugin({
      template: './index.html',
    }),

    // css抽离
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),

    // vue
    new VueLoaderPlugin(),
  ],

  optimization: {
    minimizer: [
      //压缩CSS代码
      new CssMinimizerPlugin(),

      //压缩js代码
      new TerserPlugin(),
    ],
  },
}
