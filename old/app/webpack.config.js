const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add resolve aliases to replace problematic modules
  config.resolve.alias = {
    ...config.resolve.alias,
    'jimp': path.resolve(__dirname, './src/lib/mocks/jimp-mock.js'),
    'jimp-compact': path.resolve(__dirname, './src/lib/mocks/jimp-mock.js'),
    '@jimp/core': path.resolve(__dirname, './src/lib/mocks/jimp-mock.js'),
  };

  // Add a null loader for jimp modules to prevent them from being loaded
  config.module.rules.push({
    test: /[\\/]node_modules[\\/](jimp|jimp-compact|@jimp)[\\/]/,
    use: 'null-loader',
  });

  return config;
};
