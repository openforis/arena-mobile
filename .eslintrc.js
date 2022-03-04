module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['import'],
  rules: {
    'import/no-unresolved': [2, {commonjs: true, amd: true}],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,

    'import/order': [
      'error',

      {
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
};
