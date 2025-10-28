/**
 * Webpack Configuration for ALRA
 *
 * This file tells Webpack how to bundle our TypeScript files into JavaScript
 * Webpack:
 * 1. Compiles TypeScript to JavaScript
 * 2. Minifies code (makes it smaller)
 * 3. Copies static files (manifest, HTML, CSS)
 * 4. Creates dist/ folder with final extension files
 *
 * We have separate entry points for:
 * - background.ts (the background service worker)
 * - content.ts (the content script for each webpage)
 */

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // mode: 'production' or 'development' is set via --mode flag from npm scripts
  
  entry: {
    // Each entry point becomes a separate JavaScript file
    // background script - the brain of ALRA
    background: "./src/background/background.ts",
    // content script - runs on every webpage
    content: "./src/content/content.ts",
    // popup script - renders React UI in the extension popup
    popup: "./src/popup/popup.tsx",
    // injected AI bridge - runs in page context to access window.ai
    "injected-ai-bridge": "./src/content/injected-ai-bridge.ts",
  },

  optimization: {
    // Disable code splitting for content scripts to avoid CSP issues
    // Content scripts in Chrome MV3 cannot load chunks via script injection
    splitChunks: false,
    runtimeChunk: false,
  },

  output: {
    // Where to put the compiled files
    path: path.resolve(__dirname, "dist"),
    // Name pattern for output files
    filename: "[name].js",
    // Use chrome.runtime.getURL for chunk loading
    publicPath: "",
    chunkFilename: "[name].js",
    // Global variable name for webpack runtime
    globalObject: "self",
    // Use 'jsonp' for content scripts (creates script tags)
    chunkLoading: "jsonp",
  },

  module: {
    rules: [
      {
        // Rule: when we find .ts or .tsx files, compile them with ts-loader
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        // Rule: when we find .css files, load them with style-loader and css-loader with PostCSS
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          "postcss-loader",
        ],
      },
    ],
  },

  resolve: {
    // When importing files, look for these extensions
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },

  plugins: [
    // Copy plugin: copy static files that webpack doesn't process
    new CopyPlugin({
      patterns: [
        // Copy manifest.json (extension configuration)
        {
          from: "src/manifest.json",
          to: "manifest.json",
        },
        // Copy CSS files
        {
          from: "src/styles/",
          to: "styles/",
        },
        // Copy HTML files
        {
          from: "src/popup/",
          to: "popup/",
        },
        // Copy localization files
        {
          from: "src/_locales/",
          to: "_locales/",
        },
        // Copy icons (we'll create them later)
        {
          from: "src/icons/",
          to: "icons/",
          noErrorOnMissing: true, // don't error if icons folder doesn't exist yet
        },
      ],
    }),
  ],
};
