const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require("path");


module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },

  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
    }
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [ path.resolve(__dirname, "src") ],
        exclude: /\.worker\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-react', '@babel/preset-env' ],
            plugins: [ "@babel/plugin-proposal-class-properties" ]
          },
        },
      },
      {
        test: /\.worker\.js$/,
        include: [ path.resolve(__dirname, "src") ],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [ '@babel/preset-env' ],
            }
          },
          {
            loader: "worker-loader",
            options: {
              filename: "qr-worker.min.js",
            }
          },
        ]
      }
    ],
  },

  plugins: [
    new CleanWebpackPlugin()
  ]
};