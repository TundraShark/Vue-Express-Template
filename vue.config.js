const CopyWebpackPlugin = require("copy-webpack-plugin");
// const PreloadWebpackPlugin = require("preload-webpack-plugin");
// var PrerenderSpaPlugin = require("prerender-spa-plugin");
// const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
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

      // new PrerenderSpaPlugin({
      //   staticDir: path.join(__dirname, "dist"), // Absolute path to compiled SPA
      //   // outputDir: path.join(__dirname, "prerendered"),
      //   routes: ["/about"] // List of routes to prerender
      // })

      // new PreloadWebpackPlugin({
      //   rel: "preload",
      //   include: "all"

      //   // rel: "prefetch",
      //   // include: {
      //   //   type: "asyncChunks",
      //   //   entries: ["about"]
      //   // }

      //   // rel: "preload",
      //   // as: "script"
      // })
    ]
  },
  chainWebpack: (config) => {
    config.plugin("html").tap(args => {
      args[0].template = "./src/public/index.html";
      return args;
    });
  }
};
