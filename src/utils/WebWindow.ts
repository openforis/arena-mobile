// minimal typing of the browser window (the DOM lib is not included in the TypeScript config)
export type WebMessageEvent = {
  data: unknown;
  origin: string;
  source: unknown;
};

type WebMessageListener = (event: WebMessageEvent) => void;

export type WebWindow = {
  location: { search: string };
  parent: WebWindow;
  postMessage: (message: unknown, targetOrigin: string) => void;
  addEventListener: (type: "message", listener: WebMessageListener) => void;
  removeEventListener: (type: "message", listener: WebMessageListener) => void;
};

// feature detection instead of Platform.OS: no react-native/expo imports, usable in tests
const get = (): WebWindow | null => {
  const window = (globalThis as any).window;
  return window?.document && window.location ? window : null;
};

export const WebWindow = {
  get,
};
