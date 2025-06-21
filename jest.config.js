module.exports = {
  projects: [
    '<rootDir>/packages/frontend',
    '<rootDir>/packages/backend',
    '<rootDir>/packages/common',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\.|/)(test|spec))\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
