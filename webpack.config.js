const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    main: path.resolve(__dirname, "src/index.js"),
    worker: path.resolve(__dirname, "src/worker.js")
  },
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
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-react', '@babel/preset-env' ],
            plugins: [ "@babel/plugin-proposal-class-properties" ]
          },
        },
      }
    ],
  }

};