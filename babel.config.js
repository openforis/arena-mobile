module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    /*[
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: '@welldone-software/why-did-you-render',
      },
    ],*/
  ],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '~': './src',
        },
      },
    ],
  ],
};
