const plugins = ['import', 'jest'];

module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/recommended'],
  parser: '@babel/eslint-parser',
  plugins,
  rules: {
    'import/no-unresolved': [
      2,
      {commonjs: true, amd: true, caseSensitive: false},
    ],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,

    'import/order': [
      'error',

      {
        'newlines-between': 'always',
        alphabetize: {order: 'asc', caseInsensitive: true},
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
      },
    ],
  },
  settings: {
    'import/ignore': ['react-native'],
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
};
