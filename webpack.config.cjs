const path = require('path')
const webpack = require('webpack')
const packageJson = require('./package.json')

module.exports = {
  mode: 'development',
  entry: {
    app: ['./src/entry.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.gif$/,
        use: [{ loader: 'url-loader' }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      GAME_ID: JSON.stringify(`${packageJson.author}_${packageJson.name}`)
    })
  ],
  devServer: {
    host: '0.0.0.0',
    static: [
      'src'
    ]
  }
}
