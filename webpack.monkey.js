const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = function(webpackConfig, isDevelopment) {

  webpackConfig.plugins.push(
      new CopyWebpackPlugin([
        {from: 'wasm/build', to: 'static/wasm'}
      ])
  )

}
