import { PriorityQueue } from './priority-queue';
interface NodeType {
  score: number;
}

function compare(lhs: NodeType, rhs: NodeType) {
  return +lhs.score > +rhs.score;
}

function asScore(input: number[]) {
  return input.map(v => ({ score: v }));
}

describe('Priority queue', () => {
  let input: NodeType[];
  beforeEach(() => {
    input = [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 50 }];
  });
  it('should default construct correctly', () => {
    expect(() => new PriorityQueue(compare)).not.toThrow();
  });

  it('should construct with a provided array of input values', () => {
    expect(() => new PriorityQueue(compare, input)).not.toThrow();
  });

  it('should get the top value', () => {
    const pq = new PriorityQueue(compare, input);
    expect(pq.top()).toEqual({ score: 50 });
  });

  it('should pop the top value', () => {
    const pq = new PriorityQueue(compare, input);
    expect(pq.pop()).toEqual({ score: 50 });
    expect(pq.length()).toEqual(3);
    expect(pq.top()).toEqual({ score: 3 });
  });

  it('should pop the top value twice', () => {
    const pq = new PriorityQueue(compare, input);
    expect(pq.pop()).toEqual({ score: 50 });
    expect(pq.pop()).toEqual({ score: 3 });
    expect(pq.length()).toEqual(2);
    expect(pq.top()).toEqual({ score: 2 });
  });

  it('should report the number of items in the heap', () => {
    const pq = new PriorityQueue(compare, input);
    expect(pq.length()).toEqual(4);
  });

  it('should push a new value', () => {
    const pq = new PriorityQueue(compare, input);
    pq.push({ score: 250 });
    expect(pq.top()).toEqual({ score: 250 });
    expect(pq.length()).toEqual(5);
  });

  it('should produce the values in order when pop is used repeatedly', () => {
    const data = [66, 77, 1, 5, 8, 7, 105, 55, 24, 31, 8, 8, 40, 50, 13];
    const pq = new PriorityQueue(compare, asScore(data));
    const result = [];
    while (pq.length()) {
      result.push(pq.pop().score);
    }
    data.sort((a, b) => b - a);
    data;
    expect(result).toEqual(data);
  });
});
