import pkg from 'eslint4/package.json';

const ID = 'eslint-v4';
const name = 'ESLint v4';

export default {
  id: ID,
  displayName: name,
  version: pkg.version,
  homepage: pkg.homepage,

  defaultParserID: 'babel-eslint',

  loadTransformer(callback) {
    require(['eslint4/lib/linter', '../../utils/eslint4Utils'], (
      { Linter },
      utils,
    ) => callback({ eslint: new Linter(), utils }));
  },

  transform({ eslint, utils }, transformCode, code) {
    utils.defineRule(eslint, transformCode);
    return utils.runRule(code, eslint);
  },
};
