import { createJupiterApiClient } from '@jup-ag/api'

import fs from 'node:fs'
import 'dotenv/config'
import { Wallet } from '@project-serum/anchor'
import { Connection, Keypair, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fetch from 'node-fetch'
import sleep from './util/sleep.js'
// const inputToken = 'So11111111111111111111111111111111111111112'
// const outputToken = '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs'
// const amount = '50000000'
// const fromAddress = '2kpJ5QRh16aRQ4oLZ5LnucHFDAZtEFz6omqWWMzDSNrx'
// const slippage = 0.5
// GMGN API domain
const API_HOST = 'https://gmgn.ai'

async function main(args) {
  const { inputToken, outputToken, amount, fromAddress, slippage } = args
  // Wallet initialization, skip this step if using Phantom
  const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')))
  console.log(`wallet address: ${wallet.publicKey.toString()}`)
  // Get quote and unsigned transaction
  const quoteUrl = `${API_HOST}/defi/router/v1/sol/tx/get_swap_route?token_in_address=${inputToken}&token_out_address=${outputToken}&in_amount=${amount}&from_address=${fromAddress}&slippage=${slippage}`
  let route = await fetch(quoteUrl)
  route = await route.json()
  fs.writeFileSync('route.json', JSON.stringify(route, null, 2))
  console.log(route)
  // Sign transaction
  const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64')
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
  transaction.sign([wallet.payer])
  const signedTx = Buffer.from(transaction.serialize()).toString('base64')
  console.log(signedTx)
  // Submit transaction
  let res = await fetch(`${API_HOST}/defi/router/v1/sol/tx/submit_signed_transaction`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      signed_tx: signedTx,
    }),
  })
  res = await res.json()
  fs.writeFileSync('res.json', JSON.stringify(res, null, 2))
  console.log(res)
  // Check transaction status
  // If the transaction is successful, success returns true
  // If is does not go through，expired=true will be returned after 60 seconds
  const handler = async () => {
    const hash = res.data.hash
    const lastValidBlockHeight = route.data.raw_tx.lastValidBlockHeight
    const statusUrl = `${API_HOST}/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${lastValidBlockHeight}`
    let status = await fetch(statusUrl)
    status = await status.json()
    console.log(status)
    if (status && (status.data.success === true || status.data.expired === true)) {
      return
    }
    setTimeout(handler, 1000)
  }

  handler()
}

const inputToken = 'So11111111111111111111111111111111111111112'
const outputToken = 'EszDmCQxSiGkBYF9QN1gWvY7yJornNcRUi2HPBYSpump'

const ENDPOINT = `https://boldest-chaotic-sheet.solana-mainnet.quiknode.pro/b674edecea0876c7d469511a6723cf1133fc722c` // 👈 Replace with your Metis Key or a public one https://www.jupiterapi.com/
const CONFIG = {
  basePath: 'https://public.jupiterapi.com',
}
const jupiterApi = createJupiterApiClient(CONFIG)

jupiterApi
  .quoteGet({
    inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: 100_000_000,
  })
  .then((quote) => {
    console.log(quote.outAmount, quote.outputMint)
  })
  .catch((error) => {
    console.error(error)
  })

// main({
//   inputToken: 'So11111111111111111111111111111111111111112',
//   outputToken: 'EszDmCQxSiGkBYF9QN1gWvY7yJornNcRUi2HPBYSpump',
//   amount: '50000000',
//   fromAddress: process.env.WALLET_ADDRESS,
//   slippage: 0.5,
// })

// const quoteResponse = await (
//   await fetch(
//     `https://api.jup.ag/swap/v1/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=100000000&slippageBps=50&restrictIntermediateTokens=true`
//   )
// ).json()

// console.log(JSON.stringify(quoteResponse, null, 2))
