const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const { parseEnvVariables } = require("./env");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //zsviczian
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "excalidraw.production.min": "./entry.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    library: "ExcalidrawLib",
    libraryTarget: "umd",
    filename: "[name].js",
    chunkFilename: "[name].js", // Make this the same as filename
    assetModuleFilename: "excalidraw-assets/[name][ext]",
    publicPath: "",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".css", ".scss"],
    alias: {
      "@excalidraw/excalidraw": path.resolve(__dirname),
      "@excalidraw/utils": path.resolve(__dirname, "../utils/src"),
      "@excalidraw/math": path.resolve(__dirname, "../math/src"),
      "@excalidraw/common": path.resolve(__dirname, "../common/src"),
      "@excalidraw/element": path.resolve(__dirname, "../element/src"),
    }
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader, //zsviczian replacase "style-loader"
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [autoprefixer()],
              },
            },
          },
          "sass-loader",
        ],
      },
      // So that type module works with webpack
      // https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(ts|tsx|js|jsx|mjs)$/,
        exclude:
          /node_modules[\\/](?!(browser-fs-access|canvas-roundrect-polyfill))/,
        use: [
          {
            loader: "import-meta-loader",
          },
          {
            loader: "babel-loader", // Add this babel-loader
            options: {
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { 
                  runtime: "classic", // Use classic JSX transform
                  pragma: "React.createElement",
                  pragmaFrag: "React.Fragment"
                }],
                "@babel/preset-typescript",
              ],
              plugins: [
                "transform-class-properties",
                "@babel/plugin-transform-runtime",
              ],
            },
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              configFile: path.resolve(__dirname, "../tsconfig.prod.json"),
            },
          },
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
                "@babel/preset-typescript",
              ],
              plugins: [
                "transform-class-properties",
                "@babel/plugin-transform-runtime",
              ],
            },
          },
        ],
      },
      {
        test: /^(?!.*Xiaolai).*?\.(woff|woff2|eot|ttf|otf)$/,
        type: "asset/inline",
      },
      {
        test: /(Xiaolai.*woff2)$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    //sideEffects: false, //zsviczian https://github.com/storybookjs/storybook/issues/15221
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js($|\?)/i,
      }),
    ],
    /*splitChunks: {
      chunks: "async",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
        },
      },
    },*/ //zsviczian: not required
  },
  plugins: [
    new MiniCssExtractPlugin({
      //zsviczian export to file
      filename: "styles.production.css",
    }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }), //zsviczian
    ...(process.env.ANALYZER === "true" ? [new BundleAnalyzerPlugin()] : []),
    new webpack.DefinePlugin({
      "process.env": parseEnvVariables(
        path.resolve(__dirname, "../../.env.production"),
      ),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "fonts/Assistant"), // Path to your font files
          to: path.resolve(__dirname, "dist/excalidraw-assets"), // First output path
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ["*.DS_Store"], // Ignore any unwanted files
          },
        },
        {
          from: path.resolve(__dirname, "fonts/Assistant"), // Same source path
          to: path.resolve(__dirname, "dist/excalidraw-assets-dev"), // Second output path
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ["*.DS_Store"], // Ignore any unwanted files
          },
        },
      ],
    }),
  ],
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
    },
    'react/jsx-runtime': {
      root: ['React', 'jsxRuntime'],
      commonjs2: 'react/jsx-runtime',
      commonjs: 'react/jsx-runtime',
      amd: 'react/jsx-runtime'
    },
    'react/jsx-dev-runtime': {
      root: ['React', 'jsxRuntime'],
      commonjs2: 'react/jsx-dev-runtime',
      commonjs: 'react/jsx-dev-runtime',
      amd: 'react/jsx-dev-runtime'
    }
  },
};
