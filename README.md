<div align="center"> 
  <h1> eth-nodejs 📝 </h1>
  <p> A Node.js + TypeScript + Viem project to quickly buuild web3 scripts </p>
</div>

# Abstract

A Node.js template to quickly build script for EVM chains.
The template is already setup with basic functionalities (TypeScript implementation, JSON BigInt support... etc).

## Functionalites ✨

- TypeScript native
- JSON BigInt support

## Packages 📦

- viem
- cli-progress
- cli-table3
- commander
- jest

# Setup

```bash
# Install packages
bun i

# Set env var
cp .example.env .env

# Then set your own env var in your freshly created .env file
# RPC_URL_ETH => Etehreum RPC url
# WALLET_PRIVATE_KEY => Private key of the wallet used to call the swapToVariable method
```

# Commands

Here are two examples of functions that have already been implemented:

## get-balance

Display the ETH balance of an address

- command name: `get-balance`
- arguments
  - address: the address of the balance to fetch
- options
  - -b (--blockNumber): the blockNumber snapshot to fetch the balance. ⚠️ RPC should be an archive node.

Example:

```bash
bun run get-balance 0x4801eB5a2A6E2D04F019098364878c70a05158F1 -b 19000000
```

This will fetch the ETH balance of 0x4801eB5a2A6E2D04F019098364878c70a05158F1 at the block 19000000

## get-tokens-holders

Display token holders with their corresponding balance

- command name: `get-tokens-holders`
- arguments
  - tokenAddress: the token address
  - tokenName: token name
  - tokenDeploymentBlock: deployment block number of the token
- options
  - -b (--blockNumber): the blockNumber snapshot to fetch the holders. ⚠️ RPC should be an archive node.
  - -p (--progressBar): display a progress bar

Example:

```bash
bun run get-token-holders 0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f GHO 17698470 -b 17699270
```

This will fetch the all the holders of [GHO](https://etherscan.io/token/0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f) with their corresponding balance at the block 17699270 (800 block after the token deployment)

# Tests

```bash
# run tests with bun
bun run test
```
