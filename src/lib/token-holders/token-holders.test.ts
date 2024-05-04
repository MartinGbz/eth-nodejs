import { publicClient } from "@/clients/viem";
import { replacer } from "../json-bigint";
import {
  HoldersEvents,
  Token,
  TransferEvent,
  computeHistory,
  getTokenHolders,
} from "./token-holders";
import { zeroAddress } from "viem";
import { mainnet } from "viem/chains";

const transferEvents: TransferEvent[] = [
  {
    from: zeroAddress,
    to: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
    value: 200000000000000000000n,
    blockNumber: 18000000n,
  },
  {
    from: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
    to: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
    value: 100000000000000000000n,
    blockNumber: 18500000n,
  },
  {
    from: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
    to: "0x0639556F03714A74a5fEEaF5736a4A64fF70D206",
    value: 50000000000000000000n,
    blockNumber: 19000000n,
  },
];

describe("test holders", () => {
  test("computeHistory: compute history of mocked events", () => {
    console.log("publicClient.transport", publicClient.transport);
    const holders = computeHistory(transferEvents);

    const holdersExcepted: HoldersEvents = new Map([
      [
        zeroAddress,
        [
          {
            from: zeroAddress,
            to: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
            value: 200000000000000000000n,
            blockNumber: 18000000n,
          },
        ],
      ],
      [
        "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
        [
          {
            from: zeroAddress,
            to: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
            value: 200000000000000000000n,
            blockNumber: 18000000n,
          },
          {
            from: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
            to: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
            value: 100000000000000000000n,
            blockNumber: 18500000n,
          },
        ],
      ],
      [
        "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
        [
          {
            from: "0xD730cd62CDA9cfdc109Be2d819B0337fafdCA959",
            to: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
            value: 100000000000000000000n,
            blockNumber: 18500000n,
          },
          {
            from: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
            to: "0x0639556F03714A74a5fEEaF5736a4A64fF70D206",
            value: 50000000000000000000n,
            blockNumber: 19000000n,
          },
        ],
      ],
      [
        "0x0639556F03714A74a5fEEaF5736a4A64fF70D206",
        [
          {
            from: "0x329c54289Ff5D6B7b7daE13592C6B1EDA1543eD4",
            to: "0x0639556F03714A74a5fEEaF5736a4A64fF70D206",
            value: 50000000000000000000n,
            blockNumber: 19000000n,
          },
        ],
      ],
    ]);

    expect(JSON.stringify(Object.fromEntries(holders), replacer)).toBe(
      JSON.stringify(Object.fromEntries(holdersExcepted), replacer)
    );
  });

  test("getTokenHolders: fetch tokens holders duing the first 800 block of GHO token", async () => {
    const token: Token = {
      address: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
      name: "GHO",
      deploymentBlock: 17698470n,
    };
    const endBlock = 17698470n + 800n;
    const holders = await getTokenHolders(token, endBlock, {
      network: mainnet,
    });
    expect(holders.size).toBeGreaterThan(0);
  });
});
