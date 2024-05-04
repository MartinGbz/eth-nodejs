import { Address, createPublicClient, http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { mainnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL_ETH),
});

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL_ETH),
});
export const account = privateKeyToAccount(
  process.env.WALLET_PRIVATE_KEY as Address
);
