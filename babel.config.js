module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... any other plugins
      'react-native-reanimated/plugin', // THIS MUST BE THE ABSOLUTE LAST ITEM
    ],
  };
};