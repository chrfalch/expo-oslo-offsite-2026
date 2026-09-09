const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/data/*', '../data/*', '@/screens/*', '@/state/*', '../state/*', 'expo-router', 'expo-router/*'],
          message: 'Presentation receives display models and callbacks from screen controllers.',
        }],
      }],
    },
  },
]);
