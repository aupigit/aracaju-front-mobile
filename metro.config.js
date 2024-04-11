const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const defaultConfig = getDefaultConfig(__dirname)

// Adicione 'db' à lista de extensões de ativos
defaultConfig.resolver.assetExts.push('db')

module.exports = withNativeWind(defaultConfig, { input: './src/global.css' })
