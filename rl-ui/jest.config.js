module.exports = {
  name: 'rl-ui',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/rl-ui',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
