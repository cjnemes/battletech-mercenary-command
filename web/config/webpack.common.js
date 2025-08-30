const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: './'
  },

  module: {
    rules: [
      // JavaScript processing
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      },

      // CSS processing
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-preset-env')({
                    stage: 3,
                    features: {
                      'nesting-rules': true,
                      'custom-properties': true
                    }
                  })
                ]
              }
            }
          }
        ]
      },

      // Asset processing
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[contenthash][ext]'
        }
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash][ext]'
        }
      },

      {
        test: /\.(wav|mp3|ogg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/audio/[name].[contenthash][ext]'
        }
      },

      // JSON data files
      {
        test: /\.json$/i,
        type: 'asset/resource',
        generator: {
          filename: 'data/[name].[contenthash][ext]'
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'Battletech Mercenary Command',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0',
        description: 'Professional Battletech mercenary management game'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false
      }
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    })
  ],

  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@systems': path.resolve(__dirname, '../src/systems'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@data': path.resolve(__dirname, '../src/data'),
      '@assets': path.resolve(__dirname, '../src/assets')
    }
  },

  // Performance hints
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
    hints: 'warning'
  }
};