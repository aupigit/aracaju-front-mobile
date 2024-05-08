const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname)

// Adicione 'db' à lista de extensões de ativos
defaultConfig.resolver.sourceExts.push('sql')

module.exports = withNativeWind(defaultConfig, { input: './src/global.css' })
