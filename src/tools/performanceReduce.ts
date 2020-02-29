export function performanceReduce<T, K>(
  list: T[],
  cb: (acc: K, data: T) => any,
  initialValue: K,
): Promise<K> {
  const array = [...list];
  let result: K = initialValue;

  function recursiveCalculate(done) {
    if (array.length === 0) {
      done(result);
      return;
    }

    setTimeout(() => {
      const elem = array.pop();
      result = cb(result, elem);
      recursiveCalculate(done);
    }, 0);
  }

  return new Promise<K>((resolve, reject) => {
    try {
      recursiveCalculate(resolve);
    } catch (e) {
      reject(e);
    }
  });
}
