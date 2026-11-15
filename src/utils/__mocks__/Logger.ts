export const logsPath = "logs";

export const log = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const initializeLogger = jest.fn();

export const clear = jest.fn();
