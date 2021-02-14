module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/rl-ui',
  setupFilesAfterEnv: ['./src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.spec.json',
      diagnostics: { warnOnly: true },
      stringifyContentPathRegex: '\\.html$',
    },
  },
  displayName: 'rl-ui',
};
