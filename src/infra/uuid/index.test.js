import {uuidv4} from './index';

jest.mock('uuid', () => {
  const base = '9134e286-6f71-427a-bf00-';
  let current = 100000000000;
  return {
    v4: () => {
      const uuid = base + current.toString();
      current++;
      return uuid;
    },
  };
});

describe('Uuid', () => {
  it('v1', async () => {
    const uuid = uuidv4();

    expect(uuid).toBe('9134e286-6f71-427a-bf00-100000000000');

    const uuid2 = uuidv4();

    expect(uuid2).toBe('9134e286-6f71-427a-bf00-100000000001');
  });
});
