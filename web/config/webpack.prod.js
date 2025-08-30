const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  
  devtool: 'source-map',

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],

    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20,
      maxAsyncRequests: 20,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
        // Game-specific chunks
        gameData: {
          test: /[\\/]src[\\/]data[\\/]/,
          name: 'game-data',
          chunks: 'all',
          priority: 8,
        },
        gameSystems: {
          test: /[\\/]src[\\/]systems[\\/]/,
          name: 'game-systems',
          chunks: 'all',
          priority: 7,
        },
        gameComponents: {
          test: /[\\/]src[\\/]components[\\/]/,
          name: 'game-components',
          chunks: 'all',
          priority: 6,
        }
      }
    },

    runtimeChunk: {
      name: 'runtime'
    }
  },

  // Production performance settings
  performance: {
    maxAssetSize: 300000,
    maxEntrypointSize: 300000,
    hints: 'error'
  },

  // Production stats
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    entrypoints: false,
    excludeAssets: /\.(map|txt|html)$/
  }
});