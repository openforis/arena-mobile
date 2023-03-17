export default {
  fs: {
    exists: jest.fn(() => Promise.resolve(true)),
    unlink: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
    readDir: jest.fn(() => Promise.resolve()),
  },
};
