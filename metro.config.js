const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .mjs and crypto packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Configure alias resolution
config.resolver.alias = {
  ...config.resolver.alias,
  '@': __dirname,
  'crypto': require.resolve('expo-crypto'),
};

// Resolve node_modules properly for @noble packages
config.resolver.unstable_enablePackageExports = true;

// Configure worker files for react-native-threads
// Workers need to be bundled separately
config.serializer = {
  ...config.serializer,
  // Ensure worker files are bundled correctly
  getModulesRunBeforeMainModule: () => [],
};

// Add worker file extension support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'worker.js'];

module.exports = config;
