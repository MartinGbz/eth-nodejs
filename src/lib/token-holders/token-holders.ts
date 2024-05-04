import { Address, Chain, erc20Abi, zeroAddress } from "viem";
import {
  loadERC20TransferEventsFromLocalCache,
  saveDataToJSON,
} from "@/lib/file-storing";
import { publicClient } from "@/clients/viem";
import { retryRequest } from "@/lib/utils/utils";
import { mainnet } from "viem/chains";
import { progressBar } from "../cli-ui/progress-bar";

export type HoldersBalances = Map<Address, bigint>;

export type HoldersEvents = Map<Address, TransferEvent[]>;

export type GetTransferEvents = {
  events: TransferEvent[];
  maxBlock: bigint;
} | null;

export type TransferEvent = {
  from: Address;
  to: Address;
  value: bigint;
  blockNumber: bigint;
};

export type Token = {
  name: string;
  address: Address;
  deploymentBlock: bigint;
};

export const fetchEvents = async (
  assetAddress: Address,
  startBlock: bigint,
  endBlock: bigint,
  displayProgressBar = false,
  {
    fetchSize = 10000n,
    batchSize = 10n,
    waitBetweenBatches = 0,
  }:
    | {
        fetchSize?: bigint;
        batchSize?: bigint;
        waitBetweenBatches?: number;
      }
    | undefined = {
    fetchSize: 10000n,
    batchSize: 10n,
    waitBetweenBatches: 0,
  }
) => {
  const step = batchSize * fetchSize;

  const events = [];
  for (let chunk = startBlock; chunk <= endBlock; chunk += step) {
    const eventsPromise = [];
    // console.log(
    //   `Fetching transfer events from block ${chunk} to block ${chunk + step <= endBlock ? chunk + step - 1n : endBlock} over block ${endBlock}`
    // );
    if (displayProgressBar) {
      progressBar.update(
        ((Number(chunk) - Number(startBlock)) * 20) /
          (Number(endBlock) - Number(startBlock)),
        {
          nextTask: "Get token events",
        }
      );
    }
    for (
      let fromBlock = chunk;
      fromBlock + fetchSize <= chunk + step && fromBlock <= endBlock;
      fromBlock += fetchSize
    ) {
      let toBlock = fromBlock + fetchSize - 1n;
      if (toBlock > endBlock) {
        toBlock = endBlock;
      }

      const currentEventsPromise = retryRequest(
        publicClient.getContractEvents({
          address: assetAddress,
          abi: erc20Abi,
          eventName: "Transfer",
          fromBlock: fromBlock,
          toBlock: toBlock,
        })
      );

      eventsPromise.push(currentEventsPromise);
    }

    const eventsChunk = await Promise.all(eventsPromise);

    for (let i = 0; i < eventsChunk.length; i++) {
      events.push(...eventsChunk[i]);
    }

    await new Promise((resolve) => setTimeout(resolve, waitBetweenBatches));
  }

  const parsedEvents = events
    .map((event) => {
      return {
        from: event.args.from,
        to: event.args.to,
        value: event.args.value,
        blockNumber: event.blockNumber,
      } as TransferEvent;
    })
    .filter((event: TransferEvent | null) => event !== null) as TransferEvent[];

  return parsedEvents;
};

export const getEvents = async (
  token: Token,
  network: Chain,
  endBlock: bigint,
  displayProgressBar = false
): Promise<GetTransferEvents> => {
  if (endBlock < token.deploymentBlock) {
    throw new Error(
      `The endBlock asked is before the deployment of the contract ${token.name} (deployment: ${token.deploymentBlock})`
    );
  }

  let events: TransferEvent[] = [];
  const cache = loadERC20TransferEventsFromLocalCache(
    mainnet.name.toLowerCase(),
    token.name
  );

  if (cache) {
    events = cache.events;
  }

  if (!cache || endBlock > cache.maxBlock) {
    const startBlock =
      cache && endBlock > cache.maxBlock
        ? cache.maxBlock
        : token.deploymentBlock;

    const newEvents = await fetchEvents(
      token.address,
      startBlock,
      endBlock,
      displayProgressBar
    );

    events = [...events, ...newEvents];
  }

  const dirPath = `./cache/erc-20/${network.name}/${token.name}/transfers`;
  const fileName = endBlock.toString();
  saveDataToJSON(events, dirPath, fileName, false);

  return {
    events: events,
    maxBlock: endBlock,
  };
};

export const computeHistory = (transferEvents: TransferEvent[]) => {
  const holders: HoldersEvents = new Map();

  const addToHolderHistory = (
    event: TransferEvent,
    holder: Address,
    history: TransferEvent[] | undefined
  ) => {
    const eventWithoutAddress = {
      from: event.from,
      to: event.to,
      value: event.value,
      blockNumber: event.blockNumber,
    };
    if (history) {
      history.push(eventWithoutAddress);
    } else {
      holders.set(holder, [eventWithoutAddress]);
    }
  };

  transferEvents.forEach((event) => {
    const hostoryHolderFrom = holders.get(event.from);
    addToHolderHistory(event, event.from, hostoryHolderFrom);
    const holderTo = holders.get(event.to);
    addToHolderHistory(event, event.to, holderTo);
  });

  holders.forEach((history) => {
    history.sort((a, b) => {
      return Number(a.blockNumber - b.blockNumber);
    });
  });

  return holders;
};

export const cropHistory = (holders: HoldersEvents, endBlock: bigint) => {
  for (const [address, history] of holders) {
    const newHistory = history.filter((event) => event.blockNumber <= endBlock);
    holders.set(address, newHistory);
  }
  return holders;
};

export const computeHoldersBalances = (holders: HoldersEvents) => {
  const holdersBalances: HoldersBalances = new Map();
  for (const [address, history] of holders) {
    let balance = BigInt(0n);

    for (const event of history) {
      if (event.to === address) {
        balance += BigInt(event.value);
      } else if (event.from === address) {
        balance -= BigInt(event.value);
      } else {
        throw new Error(
          `The event ${event} is not related to the holder ${address}`
        );
      }
    }

    holdersBalances.set(address, balance);
  }

  return holdersBalances;
};

const filterHolders = (
  holdersBalances: HoldersBalances,
  minTokenAmount: bigint
) => {
  const newHoldersBalances = new Map<Address, bigint>();

  holdersBalances.forEach((balance, address) => {
    if (balance > minTokenAmount && balance > 0n) {
      newHoldersBalances.set(address, balance);
    }
  });

  newHoldersBalances.delete(zeroAddress);

  return newHoldersBalances;
};

export const getTokenHolders = async (
  token: Token,
  endBlock: bigint,
  {
    minTokenAmount = 0n,
    network = mainnet,
    displayProgressBar = false,
  }: {
    minTokenAmount?: bigint;
    network?: Chain;
    displayProgressBar?: boolean;
  } = {
    minTokenAmount: 0n,
    network: mainnet,
    displayProgressBar: false,
  }
) => {
  if (displayProgressBar)
    progressBar.start(100, 0, { nextTask: "Get token events" });

  const transferEvents = await getEvents(
    token,
    network,
    endBlock,
    displayProgressBar
  );
  if (!transferEvents) {
    throw new Error("Error loading cache");
  }

  if (displayProgressBar)
    progressBar.update(20, { nextTask: "Compute holders history" });

  const holders = computeHistory(transferEvents.events);

  if (displayProgressBar)
    progressBar.update(40, { nextTask: "Crop holders history" });

  const holdersCropped = cropHistory(holders, endBlock);

  if (displayProgressBar)
    progressBar.update(60, { nextTask: "Compute holders balances" });

  const holdersBalances = computeHoldersBalances(holdersCropped);

  if (displayProgressBar)
    progressBar.update(80, { nextTask: "Filter holders balances" });

  const hodlersBalanceFiltered = filterHolders(holdersBalances, minTokenAmount);

  if (displayProgressBar) {
    progressBar.update(100);
    progressBar.stop();
  }

  return hodlersBalanceFiltered;
};
