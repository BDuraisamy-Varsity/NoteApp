const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist-web'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      // Map react-native imports to react-native-web
      'react-native$': 'react-native-web',
      // Stub AsyncStorage with a localStorage-based implementation for web
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/web-stubs/async-storage.js'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        // Transpile react-native-* packages that ship untranspiled source
        exclude: /node_modules\/(?!(react-native-web|react-native-safe-area-context|@react-native-async-storage)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:@react-native/babel-preset'],
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    open: true,
  },
};
