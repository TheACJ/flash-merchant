// index.js - application entry used to ensure polyfills run before app modules
// Polyfill Buffer globally for React Native/Expo environment
import { Buffer } from 'buffer'

// Hand off to expo-router entry (original app entry)
import 'expo-router/entry'
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}
