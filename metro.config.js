const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add the @ alias for project root
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Configure alias resolution
config.resolver.alias = {
  ...config.resolver.alias,
  '@': __dirname,
};

module.exports = config;
