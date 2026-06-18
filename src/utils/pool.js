// Generic object pool — call acquire() to get an item, release() to return it.
// factory() is only called when the free list is empty.
export function createPool(factory) {
  const free = [];
  return {
    acquire:  ()     => free.pop() ?? factory(),
    release:  (item) => free.push(item),
    freeCount: ()    => free.length,
  };
}
