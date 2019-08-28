/* eslint import/no-extraneous-dependencies : 0 */

const babelOptions = {
  presets: ['babel-preset-gatsby'],
};
module.exports = require('babel-jest').createTransformer(babelOptions);
