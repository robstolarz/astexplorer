import compileModule from '../../utils/compileModule';
import transpile from '../../transpilers/babel';
import { parseNoPatch } from 'babel-eslint';
import { parse as tsEsParse } from '@typescript-eslint/parser';

const esquery = require('esquery');

export function formatResults(results) {
  return results.length === 0
    ? '// Lint rule not fired.'
    : results.map(formatResult).join('').trim();
}

export function formatResult(result) {
  console.log(result);
  var pointer = '-'.repeat((result.column || 1) - 1) + '^';
  return `
// ${result.message} (at ${result.line}:${result.column})
   ${result.source}
// ${pointer}
`;
}

export function defineRule(eslint, code) {
  console.log('things are still compiling');
  // Compile the transform code and install it as an ESLint rule. The rule
  // name doesn't really matter here, so we'll just use a hard-coded name.
  code = transpile(code);
  const rule = compileModule(code);
  eslint.defineRule('astExplorerRule', rule.default || rule);
}

export function runRule(code, eslint) {
  // Run the ESLint rule on the AST of the provided code.
  // Reference: http://eslint.org/docs/developer-guide/nodejs-api
  eslint.defineParser('@typescript-eslint/parser', {
    parse(code) {
      try {
        console.log(esquery);
        // why all the options? because eslint adds them and this expects them
        // https://github.com/typescript-eslint/typescript-eslint/issues/2742#issuecomment-723481686
        return tsEsParse(code, {
          sourceType: 'module',
          loc: true,
          range: true,
          raw: true,
          tokens: true,
          comment: true,
          eslintVisitorKeys: true,
          eslintScopeManager: true,
          filePath: 'test.tsx',
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  });
  eslint.defineParser('babel-eslint', {
    parse(code) {
      return parseNoPatch(code, { sourceType: 'module' });
    },
  });
  const results = eslint.verifyAndFix(
    code,
    {
      env: { es6: true },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { experimentalObjectRestSpread: true, jsx: true },
      },
      rules: {
        astExplorerRule: 2,
      },
    },
    { filename: 'test.tsx' },
  );
  let output = formatResults(results.messages);
  output += `

// Fixed output follows:
// ${'-'.repeat(80)}
`;
  return output + results.output;
}
