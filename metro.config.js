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

module.exports = config;
