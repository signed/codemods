import { isLibraryImport, isSourceFileImport } from './shared';

describe('shared', () => {
  describe('isLibraryImport', () => {
    test('import starting with an @ most likely represent an external library', () => {
      expect(isLibraryImport('@org/package')).toBe(true);
    });
    test('./same-directory is no library', () => {
      expect(isLibraryImport('./same-directory')).toBe(false);
    });
  });
  describe('isSourceFileImport', () => {
    test('no extension most likely means source file', () => {
      expect(isSourceFileImport('./no-extension')).toBe(true);
    });
    test('.png is an image format', () => {
      expect(isSourceFileImport('./some.png')).toBe(false);
    });
    test('.json is a data file', () => {
      expect(isSourceFileImport('./some.json')).toBe(false);
    });
  });
});
