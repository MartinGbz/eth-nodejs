import { publicClient } from "@/clients/viem";
import { formatEther, isAddress } from "viem";
import Table from "cli-table3";
import colors from "colors";

export const getBalanceAction = async (
  address: string,
  { blockNumber }: { blockNumber?: string }
) => {
  if (!isAddress(address)) {
    throw new Error("Invalid address");
  }
  if (blockNumber && isNaN(Number(blockNumber))) {
    throw new Error("Invalid block number");
  }

  const balance = await publicClient.getBalance({
    address,
    blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
  });
  const balanceFormatted = formatEther(balance);

  const balanceTable = new Table({
    head: [colors.green("Addresses"), colors.green("Balance")],
  });
  balanceTable.push([address, balanceFormatted]);
  console.log(balanceTable.toString());
};
