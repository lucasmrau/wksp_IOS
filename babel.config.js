module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: ["nativewind/babel", 'react-native-reanimated/plugin',  [
      'module:react-native-dotenv',
      {
        'moduleName': '@env',
        'allowUndefined': false
      }
    ]]
  };
};
