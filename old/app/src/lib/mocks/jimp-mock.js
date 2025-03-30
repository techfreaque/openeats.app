// No-op mock for Jimp
module.exports = {
  // This is an empty mock that returns promises that resolve to empty values
  read: function() {
    return Promise.resolve({
      resize: () => this,
      quality: () => this,
      getBase64Async: () => Promise.resolve('data:image/png;base64,'),
      writeAsync: () => Promise.resolve(),
      getWidth: () => 0,
      getHeight: () => 0,
    });
  },
  // Constants
  AUTO: 'auto',
  // No-op functions
  parseBitmap: function() {},
};
