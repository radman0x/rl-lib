function swap<T>(arr: T[], a: number, b: number) {
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

type Comparator<T> = (lhs: T, rhs: T) => boolean;

function heapUp<T>(heap: T[], index: number, comparator: Comparator<T>) {
  const parent = Math.floor(index / 2);
  if (parent === 0) {
    return;
  } else if (comparator(heap[index], heap[parent])) {
    swap(heap, index, parent);
    heapUp(heap, parent, comparator);
  }
}

function heapDown<T>(heap: T[], node: number, comparator: Comparator<T>) {
  const [left, right] = [2 * node, 2 * node + 1]; /*?*/
  if (left >= heap.length) {
    return;
  } else if (right >= heap.length) {
    if (comparator(heap[left], heap[node])) {
      left;
      node;
      swap(heap, left, node);
      heapDown(heap, left, comparator);
    } else {
      return;
    }
  } else {
    if (
      comparator(heap[left], heap[node]) ||
      comparator(heap[right], heap[node])
    ) {
      if (comparator(heap[left], heap[right])) {
        swap(heap, left, node);
        heapDown(heap, left, comparator);
      } else {
        swap(heap, right, node);
        heapDown(heap, right, comparator);
      }
    }
  }
}

function heapify<T>(input: T[], comparator: Comparator<T>) {
  const heap = [null, ...input];
  for (let i = heap.length; i > 0; --i) {
    i;
    heapDown(heap, i, comparator);
  }
  return heap;
}

export class PriorityQueue<T> {
  private queue: T[];
  constructor(private comparator: Comparator<T>, input: T[] = []) {
    this.queue = heapify(input, comparator);
  }

  top(): T {
    return this.queue[1];
  }

  pop(): T {
    swap(this.queue, 1, this.queue.length - 1);
    const result = this.queue.pop();
    heapDown(this.queue, 1, this.comparator);
    return result;
  }

  push(val: T) {
    this.queue.push(val);
    heapUp(this.queue, this.queue.length - 1, this.comparator);
  }

  length(): number {
    return this.queue.length - 1;
  }
}
