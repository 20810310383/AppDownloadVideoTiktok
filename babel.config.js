module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            '@': './',          
            '@app': './app',           // (tùy chọn) nếu dùng expo-router
            '@assets': './assets',
            '@components': './components',
            '@constants': './constants',
            '@i18n': './i18n',
            '@services': './services',
            '@theme': './theme',
            '@types': './types',
            '@utils': './utils',
        },
      }],
      'expo-router/babel',            // ✅ chỉ cần string, không require.resolve
      'react-native-worklets/plugin', // ✅ thay cho reanimated/plugin
    ],
  };
};
