module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '.*\\.e2e\\.spec\\.ts',
        '.*\\.fuctional\\.spec\\.ts',
    ],
    globalSetup: 'jest-preset-angular/global-setup',
}