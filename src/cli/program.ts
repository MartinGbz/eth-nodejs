import { getBalanceAction } from "@/actions/get-balance";
import { getTokenHoldersAction } from "@/actions/get-token-holders";
import { Command } from "commander";

const getBalanceCmd = new Command("get-balance");
getBalanceCmd.arguments("address");
getBalanceCmd.option(
  "-b, --blockNumber [block_number]",
  "The block number from which to get the balance"
);
getBalanceCmd.action(getBalanceAction);

const getTokenHoldersCmd = new Command("get-token-holders");
getTokenHoldersCmd.arguments("tokenAddress");
getTokenHoldersCmd.arguments("tokenName");
getTokenHoldersCmd.arguments("tokenDeploymentBlock");
getTokenHoldersCmd.option(
  "-b, --blockNumber [block_number]",
  "The block number from which to get the balance"
);
getTokenHoldersCmd.action(getTokenHoldersAction);

export const program = new Command();
program.addCommand(getBalanceCmd);
program.addCommand(getTokenHoldersCmd);
