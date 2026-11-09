const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve shared packages outside apps/delivery-app
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages/shared'),
];

config.resolver.extraNodeModules = {
  '@gomeat/shared': path.resolve(monorepoRoot, 'packages/shared/src'),
};

module.exports = config;
