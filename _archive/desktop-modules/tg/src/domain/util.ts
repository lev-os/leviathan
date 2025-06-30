export function extractSolanaContractAddress(text: string) {
  const regex = /([a-zA-Z0-9]{43,44})/ // Regex for Solana addresses
  const match = text.match(regex)

  if (match) {
    return match[0]
  } else {
    return null
  }
}
