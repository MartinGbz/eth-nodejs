import { Address } from "viem";
import { fetchInBatches, mergeMap, retryRequest } from "./utils";

const mockFetchFunction = async (
  user: number,
  param1: string,
  param2: string
) => {
  return { user, param1, param2 };
};

describe("fetchInBatches function", () => {
  it("should succeeds the 1st time", async () => {
    const succeedingRequest = jest
      .fn()
      .mockResolvedValueOnce(new Promise((resolve) => resolve("Success")));

    const result = await retryRequest(succeedingRequest(), 5, 100);

    expect(result).toEqual("Success");
  }, 1000);

  // Not possble to mock a promise (and test the number of resolving etc...) with jest

  it("should fetch data in batches and return results", async () => {
    const testData = [1, 2, 3, 4, 5];
    const testParams = { param1: "value1", param2: "value2" };
    const batchSize = 2;

    const result = await fetchInBatches(
      testData,
      mockFetchFunction,
      testParams,
      batchSize
    );

    const expectedResults = [
      { user: 1, param1: "value1", param2: "value2" },
      { user: 2, param1: "value1", param2: "value2" },
      { user: 3, param1: "value1", param2: "value2" },
      { user: 4, param1: "value1", param2: "value2" },
      { user: 5, param1: "value1", param2: "value2" },
    ];
    expect(result).toEqual(expectedResults);
  });

  it("should merge 2 map: map merged should have 1 element", async () => {
    const map1: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const map2: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const mapMerged = mergeMap(map1, map2);
    expect(mapMerged.size).toEqual(1);
    expect(mapMerged).toEqual(
      new Map([
        [
          "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
          "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
        ],
      ])
    );
  });

  it("should merge 2 map: map merged should set only the last element register", async () => {
    const map1: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const map2: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
      ],
    ]);
    const mapMerged = mergeMap(map1, map2);
    expect(mapMerged.size).toEqual(1);
    expect(mapMerged).toEqual(
      new Map([
        [
          "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
          "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        ],
      ])
    );
  });

  it("should merge 2 map: map should have the 2 map elements", async () => {
    const map1: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const map2: Map<Address, Address> = new Map([
      [
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        "0x57ab7ee15cE5ECacB1aB84EE42D5A9d0d8112922",
      ],
    ]);
    const expectedMapMerged = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
      [
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        "0x57ab7ee15cE5ECacB1aB84EE42D5A9d0d8112922",
      ],
    ]);
    const mapMerged = mergeMap(map1, map2);
    expect(mapMerged.size).toEqual(2);
    expect(mapMerged).toEqual(expectedMapMerged);
  });

  it("should merge 2 map: map should have the 2 map elements", async () => {
    const map1: Map<Address, Address> = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const map2: Map<Address, Address> = new Map([
      [
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const expectedMapMerged = new Map([
      [
        "0x4801eB5a2A6E2D04F019098364878c70a05158F1",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
      [
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        "0xa7073ca54734faBa5aFa5F1e01Cd31a03Ff7699F",
      ],
    ]);
    const mapMerged = mergeMap(map1, map2);
    expect(mapMerged.size).toEqual(2);
    expect(mapMerged).toEqual(expectedMapMerged);
  });
});
