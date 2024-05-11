import {describe, expect, test, jest} from '@jest/globals';
import { helloWorld } from "./api.js";

describe('helloWorld', () => {
  test('should return "Hello World"', () => {
    expect.assertions(2);
    const logSpy = jest.spyOn(console, 'log');
    expect(helloWorld(false)).toBe("Hello World");
    expect(logSpy).toHaveBeenCalledWith("Hello World");
  });
  
  test('should append exclamation mark', () => {
    expect.assertions(2);
    const logSpy = jest.spyOn(console, 'log');
    expect(helloWorld(true)).toBe("Hello World!");
    expect(logSpy).toHaveBeenCalledWith("Hello World!");
  });
});