export class Stack<T> {
  private items: T[] = [];

  // Add element (push)
  push(element: T): void {
    this.items.push(element);
  }

  // Remove top element (pop)
  pop(): T | undefined {
    return this.items.pop();
  }

  // View top element without removing
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // Check if empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Get size
  size(): number {
    return this.items.length;
  }

  // Clear stack
  clear(): void {
    this.items = [];
  }

  // Optional: print/debug
  toString(): string {
    return this.items.toString();
  }
}