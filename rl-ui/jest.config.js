module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/rl-ui',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
  setupFilesAfterEnv: ['./src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.spec.json',
      diagnostics: { warnOnly: true },
      stringifyContentPathRegex: '\\.html$',
      astTransformers: {
        before: ['jest-preset-angular/InlineHtmlStripStylesTransformer'],
      },
    },
  },
  displayName: 'rl-ui',
};
