import { addProperty } from './systems.utils';

describe('Typesafe add regular property', () => {
  describe('Add simple values', () => {
    let newValue: number;
    let input: { existingProp: number };
    let output: typeof input & { newProp: number };
    beforeEach(() => {
      newValue = 5;
      input = { existingProp: 1 };
      output = addProperty(input, 'newProp', newValue);
    });
    it('should add a property with a value', () => {
      expect(output.newProp).toEqual(newValue);
    });
    it('should not modify the input object and return a deep copy with the modifications', () => {
      expect(input).not.toBe(output);
    });
  });

  it('should add a property with an array value', () => {
    let newValue: number[];
    let input: { existingProp: number };
    let output: typeof input & { newProp: number[] };
    newValue = [1, 2, 3];
    input = { existingProp: 1 };
    output = addProperty(input, 'newProp', newValue);

    expect(output.newProp).toEqual(newValue);
    expect(output.newProp).not.toBe(newValue);
  });

  it('should add a property with an object value', () => {
    let newValue: { a: number };
    let input: { existingProp: number };
    let output: typeof input & { newProp: { a: number } };
    newValue = { a: 5 };
    input = { existingProp: 1 };
    output = addProperty(input, 'newProp', newValue);

    expect(output.newProp).toEqual(newValue);
    expect(output.newProp).not.toBe(newValue);
  });
});
