// Allows a notification once per key until reset (e.g. once per location watch and SRS).
export const createOncePerKeyNotifier = () => {
  const notifiedKeys = new Set<string>();
  return {
    shouldNotify: (key: string): boolean => {
      if (notifiedKeys.has(key)) return false;
      notifiedKeys.add(key);
      return true;
    },
    reset: () => notifiedKeys.clear(),
  };
};
