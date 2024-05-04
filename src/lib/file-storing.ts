import fs from "fs";
import {
  GetTransferEvents,
  TransferEvent,
} from "@/lib/token-holders/token-holders";
import { replacer, reviver } from "./json-bigint";

export const saveDataToJSON = <T>(
  data: T,
  dirPath: string,
  fileName: string,
  displayLogs = true
) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(
    `${dirPath}/${fileName}.json`,
    JSON.stringify(data, replacer, 2)
  );

  if (displayLogs) {
    console.log(
      `\nJSON successfully generated at ${dirPath.slice(1)}/${fileName}.json`
    );
  }
};

export const loadERC20TransferEventsFromLocalCache = (
  networkName: string,
  erc20Name: string
): GetTransferEvents => {
  const baseDir = `./cache/erc-20/${networkName}/${erc20Name}/transfers`;

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const fileList = fs.readdirSync(baseDir);

  const maxBlock = fileList.reduce((max, file) => {
    // don't take into account the .DS_Store file
    if (file === ".DS_Store") return -1;

    const fileName = file.split(".")[0];
    const block = Number(fileName);
    return block > max ? block : max;
  }, -1);

  if (maxBlock === -1) {
    return null;
  }

  // get the file with the max block
  const files = fileList.filter((file) => file.includes(maxBlock.toString()));

  const transferEvents = fs.readFileSync(`${baseDir}/${files[0]}`, "utf-8");
  let transferEventsParsed: TransferEvent[] = JSON.parse(
    transferEvents,
    reviver
  );

  transferEventsParsed = transferEventsParsed.map((event) => {
    return {
      ...event,
      value: BigInt(event.value),
      blockNumber: BigInt(event.blockNumber),
    };
  });

  return {
    events: transferEventsParsed,
    maxBlock: BigInt(maxBlock),
  };
};
