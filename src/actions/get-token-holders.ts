import { publicClient } from "@/clients/viem";
import { formatEther, isAddress } from "viem";
import Table from "cli-table3";
import colors from "colors";
import { Token, getTokenHolders } from "@/lib/token-holders/token-holders";

export const getTokenHoldersAction = async (
  tokenAddress: string,
  tokenName: string,
  tokenDeploymentBlock: string,
  { blockNumber, progressBar }: { blockNumber?: string; progressBar?: boolean }
) => {
  if (!isAddress(tokenAddress)) {
    throw new Error("Invalid address");
  }
  const endBlock = blockNumber
    ? BigInt(blockNumber)
    : await publicClient.getBlockNumber();

  const token: Token = {
    address: tokenAddress,
    name: tokenName,
    deploymentBlock: BigInt(tokenDeploymentBlock),
  };

  const holders = await getTokenHolders(token, endBlock, {
    displayProgressBar: progressBar,
  });

  const balanceTable = new Table({
    head: [colors.green("Addresses"), colors.green("Balances")],
  });
  for (const [address, balance] of holders) {
    balanceTable.push([address, formatEther(balance)]);
  }
  console.log(balanceTable.toString());
};
