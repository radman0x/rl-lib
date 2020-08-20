import { selAddToArray, selSuggest } from './core.utils';
import * as _ from 'lodash';

describe('Selector suggest', () => {
  it('should add a value if it does not exist', () => {
    const data = {};
    selSuggest(data, 'some.value', 7);
    expect(data).toEqual({ some: { value: 7 } });
  });
  it('should not replace a value if it does already exist', () => {
    const data = { some: { value: 7 } };
    selSuggest(data, 'some.value', 11);
    expect(data).toEqual({ some: { value: 7 } });
  });
});

describe('Add to Array', () => {
  let data: object;
  let selector: string;
  beforeEach(() => {
    data = {};
    selector = 'some.nested.value';
  });
  it('should create an array when it does not exist', () => {
    selAddToArray(data, selector, 6);
    expect(_.get(data, selector)).toEqual([6]);
  });

  it('should add a value to an existing array', () => {
    data = { some: { nested: { value: [1, 2] } } };
    selAddToArray(data, selector, 6);
    expect(_.get(data, selector)).toEqual([1, 2, 6]);
  });

  it('should throw if a value already exists and is not an array', () => {
    data = { some: { nested: { value: {} } } };
    expect(() => selAddToArray(data, selector, 6)).toThrow();
  });
});
