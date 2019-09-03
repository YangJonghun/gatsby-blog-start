/**
 * Gatsby includes below built-in plugins
 * (based on Creact React App config - eslint-config-react-app)
 * @typescript-eslint/eslint-plugin
 * @typescript-eslint/parser
 * eslint-plugin-flowtype
 * eslint-plugin-graphql
 * eslint-plugin-import
 * eslint-plugin-jsx-a11y
 * eslint-plugin-react-hooks
 * eslint-plugin-react
 */

const jsExtensions = ['.js', '.jsx'];
const tsExtensions = ['.ts', '.tsx'];
const allExtensions = jsExtensions.concat(tsExtensions);

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'airbnb',
    'prettier/@typescript-eslint',
    'prettier',
  ],
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': allExtensions,
    'import/parsers': {
      '@typescript-eslint/parser': tsExtensions,
    },
    'import/resolver': {
      node: {
        extensions: allExtensions,
        paths: ['src'],
      },
    },
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.ts', 'tsx'] }],
    'react/jsx-one-expression-per-line': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*', '**/*.story.*', '**/stories/*'] },
    ],
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/graphqlTypes.ts'],
      rules: {
        camelcase: 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/prefer-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
