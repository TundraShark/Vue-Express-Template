const CopyWebpackPlugin = require("copy-webpack-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const path = require("path");

if     (process.env.local)                     process.env.VUE_APP_BACKEND = "http://localhost";
else if(process.env.NODE_ENV == "development") process.env.VUE_APP_BACKEND = "https://api.dev.example.com";
else if(process.env.NODE_ENV == "production")  process.env.VUE_APP_BACKEND = "https://api.example.com";

module.exports = {
  devServer: {
    port: 8080
  },
  configureWebpack: {
    entry: "./src/main.ts",
    plugins: [
      new CopyWebpackPlugin([{
        from: "./src/public",
        // to: "./dist",
        to: ".",
        toType: "dir"
        // ,ignore: [ "index.html"]
      }]),
      new PreloadWebpackPlugin({
        rel: "preload",
        as: "script"
      })
    ]
  },
  chainWebpack: (config) => {
    config.plugin("html").tap(args => {
      args[0].template = "./src/public/index.html";
      return args;
    });
  }
};
