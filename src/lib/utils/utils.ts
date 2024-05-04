export const retryRequest = async <T>(
  request: Promise<T>,
  iterations = 3,
  wait = 600000
): Promise<T> => {
  for (let i = 0; i < iterations; i++) {
    try {
      return await request;
    } catch (error) {
      // console.log(error);
      console.log("\nRetry in 5s...");
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw new Error("Max retry reached");
};

export const fetchInBatches = async <T, P extends object, B>(
  data: T[],
  // args can be any arguments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFunction: (users: T, ...args: any[]) => Promise<B>,
  params: P,
  batchSize = 10,
  wait = 0
) => {
  const results = [];

  for (let i = 0; i < data.length; i += batchSize) {
    const dataBatch = data.slice(i, i + batchSize);
    const resultsBatch = await Promise.all(
      dataBatch.map((dataItem) =>
        retryRequest(fetchFunction(dataItem, ...Object.values(params)))
      )
    );
    results.push(...resultsBatch);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return results;
};

/**
 * Merge 2 maps
 * The map2 has the priority over the map1
 * @param map1
 * @param map2
 * @returns The fusion of the Maps
 */
export const mergeMap = <K, V>(map1: Map<K, V>, map2: Map<K, V>) => {
  const mergedMap: Map<K, V> = new Map([...map1.entries(), ...map2.entries()]);
  return mergedMap;
};
