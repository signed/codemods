import { isLibraryImport } from './shared';

describe('shared', () => {
  describe('isLibraryImport', () => {
    test('import starting with an @ most likely represent an external library', () => {
      expect(isLibraryImport('@org/package')).toBe(true);
    });
    test('./same-directory is no library', () => {
      expect(isLibraryImport('./same-directory')).toBe(false);
    });
  });
});
