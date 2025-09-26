const { containsURL } = require('../lib/urlUtils');

describe('containsURL', () => {
  test('should return true for valid URLs', () => {
    expect(containsURL('http://example.com')).toBe(true);
    expect(containsURL('https://www.example.com/path')).toBe(true);
    expect(containsURL('www.example.com')).toBe(true);
    expect(containsURL('example.com')).toBe(true);
    expect(containsURL('https://example.com/test?query=param')).toBe(true);
  });

  test('should return false for common filenames', () => {
    expect(containsURL('main.js')).toBe(false);
    expect(containsURL('archive.zip')).toBe(false);
    expect(containsURL('test.py')).toBe(false);
  });

  test('should return false for text with dots that are not URLs', () => {
    expect(containsURL('this.is.a.test')).toBe(false);
    expect(containsURL('hello.world')).toBe(false);
    expect(containsURL('a.b.c.d')).toBe(false);
  });

  test('should return false for empty strings', () => {
    expect(containsURL('')).toBe(false);
  });
});