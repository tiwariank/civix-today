module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // other plugins here...
    // MUST put react-native-reanimated.plugin last
    'react-native-reanimated/plugin'
  ],
};