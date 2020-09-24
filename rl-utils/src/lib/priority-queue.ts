type Comparator<T> = (lhs: T, rhs: T) => boolean;
type IdExtractor<T> = (e: T) => string;
type SwapEvent = (a: number, b: number) => void;

function swap<T>(arr: T[], a: number, b: number, swapEvent: SwapEvent = null) {
  console.log(`{${a}, ${b}}`);
  if (swapEvent) {
    swapEvent(a, b);
  }
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function heapUp<T>(
  heap: T[],
  index: number,
  comparator: Comparator<T>,
  swapEvent: SwapEvent = null
) {
  const parent = Math.floor(index / 2);
  if (parent === 0) {
    return;
  } else if (comparator(heap[index], heap[parent])) {
    swap(heap, index, parent, swapEvent);
    heapUp(heap, parent, comparator, swapEvent);
  }
}

function heapDown<T>(
  heap: T[],
  node: number,
  comparator: Comparator<T>,
  swapEvent: SwapEvent = null
) {
  const [left, right] = [2 * node, 2 * node + 1];
  if (left >= heap.length) {
    return;
  } else if (right >= heap.length) {
    if (comparator(heap[left], heap[node])) {
      swap(heap, left, node, swapEvent);
      heapDown(heap, left, comparator, swapEvent);
    } else {
      return;
    }
  } else {
    if (
      comparator(heap[left], heap[node]) ||
      comparator(heap[right], heap[node])
    ) {
      if (comparator(heap[left], heap[right])) {
        swap(heap, left, node, swapEvent);
        heapDown(heap, left, comparator, swapEvent);
      } else {
        swap(heap, right, node, swapEvent);
        heapDown(heap, right, comparator, swapEvent);
      }
    }
  }
}

function heapify<T>(input: T[], comparator: Comparator<T>) {
  const heap = [null, ...input];
  for (let i = heap.length; i > 0; --i) {
    heapDown(heap, i, comparator);
  }
  return heap;
}

export class PriorityQueue<T> {
  private queue: T[];
  private idMap = {};
  private swapEvent: SwapEvent;
  constructor(
    private comparator: Comparator<T>,
    private extractor: IdExtractor<T>,
    input: T[] = []
  ) {
    this.queue = heapify(input, comparator);
    for (let i = 1; i < this.queue.length; ++i) {
      this.idMap[this.extractor(this.queue[i])] = i;
    }
    this.swapEvent = (a: number, b: number) => {
      const aId = this.extractor(this.queue[a]);
      const bId = this.extractor(this.queue[b]);
      console.log(`aId: ${aId} -> ${b}, bId ${bId} -> ${a}`);
      this.idMap[aId] = b;
      this.idMap[bId] = a;
    };
  }

  top(): T {
    return this.queue[1];
  }

  pop(): T {
    swap(this.queue, 1, this.queue.length - 1);
    const result = this.queue.pop();
    delete this.idMap[this.extractor(result)];
    heapDown(this.queue, 1, this.comparator, this.swapEvent);
    return result;
  }

  push(val: T) {
    this.queue.push(val);
    heapUp(this.queue, this.queue.length - 1, this.comparator, this.swapEvent);
  }

  length(): number {
    return this.queue.length - 1;
  }

  get(id: string): T {
    return this.queue[this.idMap[id]];
  }

  update(id: string, newVal: T) {
    const index = this.idMap[id];
    const oldVal = this.queue[index];
    this.queue[index] = newVal;
    if (this.comparator(oldVal, newVal)) {
      heapDown(this.queue, index, this.comparator, this.swapEvent);
    } else {
      heapUp(this.queue, index, this.comparator, this.swapEvent);
    }
  }

  has(id: string): boolean {
    return this.idMap[id] !== undefined;
  }
}
