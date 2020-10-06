import { PriorityQueue } from './priority-queue';
interface NodeType {
  id: string;
  score: number;
}

function compare(lhs: NodeType, rhs: NodeType) {
  return +lhs.score > +rhs.score;
}

function extract(e: NodeType) {
  return e.id;
}

function asScore(input: number[]) {
  return input.map((v, i) => ({ id: i.toString(), score: v }));
}

describe('Priority queue', () => {
  let input: NodeType[];
  beforeEach(() => {
    input = asScore([1, 2, 3, 50]);
  });
  it('should default construct correctly', () => {
    expect(() => new PriorityQueue(compare, extract)).not.toThrow();
  });

  it('should construct with a provided array of input values', () => {
    expect(() => new PriorityQueue(compare, extract, input)).not.toThrow();
  });

  it('should get the top value', () => {
    const pq = new PriorityQueue(compare, extract, input);
    expect(pq.top()).toMatchObject({ score: 50 });
  });

  it('should pop the top value', () => {
    const pq = new PriorityQueue(compare, extract, input);
    expect(pq.pop()).toMatchObject({ score: 50 });
    expect(pq.length()).toEqual(3);
    expect(pq.top()).toMatchObject({ score: 3 });
  });

  it('should pop the top value twice', () => {
    const pq = new PriorityQueue(compare, extract, input);
    expect(pq.pop()).toEqual({ id: '3', score: 50 });
    expect(pq.pop()).toEqual({ id: '2', score: 3 });
    expect(pq.length()).toEqual(2);
    expect(pq.top()).toEqual({ id: '1', score: 2 });
  });

  it('should report the number of items in the heap', () => {
    const pq = new PriorityQueue(compare, extract, input);
    expect(pq.length()).toEqual(4);
  });

  it('should push a new value', () => {
    const pq = new PriorityQueue(compare, extract, input);
    pq.push({ id: 'test', score: 250 });
    expect(pq.top()).toEqual({ id: 'test', score: 250 });
    expect(pq.length()).toEqual(5);
  });

  it('should produce the values in order when pop is used repeatedly', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    const result = [];
    while (pq.length()) {
      result.push(pq.pop().score);
    }
    data.sort((a, b) => b - a);
    expect(result).toEqual(data);
  });

  it('should allow retrieval of an element by id', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    expect(pq.get('0')).toEqual({ id: '0', score: 66 });
    expect(pq.get('4')).toEqual({ id: '4', score: 8 });
  });

  it('should allow modifying the value of an element by id', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    pq.update('0', { id: '0', score: 1000 });
    pq.update('1', { id: '1', score: 0 });
    data[0] = 1000;
    data[1] = 0;

    // verify all ids have been maintained
    for (let i = 0; i < data.length; ++i) {
      expect(pq.get(i.toString())).toEqual({
        id: i.toString(),
        score: data[i],
      });
    }

    data.sort((a, b) => b - a);
    const result = [];
    while (pq.length()) {
      result.push(pq.pop().score);
    }
  });

  it('should allow checking if an element with id exists', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    expect(pq.has('0')).toEqual(true);
    expect(pq.has((data.length - 1).toString())).toEqual(true);
    expect(pq.has('100')).toEqual(false);
  });

  it('should report that an element does not exist once it has been popped from the collection', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    pq.pop();
    expect(pq.has('6')).toEqual(false);
    expect(pq.get('1')).toEqual({ id: '1', score: 77 });
  });

  it('should allow retrieval by id after new elements have been pushed', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, extract, asScore(data));
    pq.push({ id: 'blah', score: 1 });
    pq.push({ id: 'blah1', score: 10 });
    pq.push({ id: 'blah2', score: 100 });
    pq.push({ id: 'blah3', score: 1000 });
    for (let i = 0; i < data.length; ++i) {
      expect(pq.get(i.toString())).toEqual({
        id: i.toString(),
        score: data[i],
      });
    }
  });

  it('s', () => {});
});
