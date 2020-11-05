import * as _ from 'lodash';

export function selSuggest(obj: object, selector: string, value: any) {
  if (!_.has(obj, selector)) {
    _.set(obj, selector, value);
  }
}

export function selAddToArray(obj: object, selector: string, value: any) {
  if (_.has(obj, selector)) {
    const current = _.get(obj, selector);
    if (!Array.isArray(current)) {
      throw Error(`Value in object at selector: ${selector} is not an Array!`);
    } else {
      current.push(value);
    }
  } else {
    _.set(obj, selector, [value]);
  }
}

export function selSuggestToArray(obj: object, selector: string, value: any) {
  selSuggest(obj, selector, []);
  selAddToArray(obj, selector, value);
}

export function logName(base: string, name: string) {
  base = base ? `${base}.` : '';
  return `${base}${name}`;
}
