module.exports = {
  name: 'rl-procgen',
  preset: '../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/libs/rl-procgen',
  setupTestFrameworkScriptFile: './src/test-setup.ts',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.spec.json',
      diagnostics: { warnOnly: true },
      stringifyContentPathRegex: '\\.html$',
      astTransformers: ['jest-preset-angular/InlineHtmlStripStylesTransformer']
    }
  }
};
