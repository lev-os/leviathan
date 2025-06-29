import Moralis from 'moralis'
import { strategy2x } from './bot-strategy'

export const CA_DB = {}

const apiKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjMzNzc3MDhjLWI3YzMtNDhkOS1iMTlhLTY5OTY5ODg3N2NkZCIsIm9yZ0lkIjoiNDI5OTMxIiwidXNlcklkIjoiNDQyMjQyIiwidHlwZUlkIjoiZGQ1YzZjMmUtMjY4Zi00MmY2LWIxNWMtNzBmOGE1NGM0ZjVhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzg4OTc5NzksImV4cCI6NDg5NDY1Nzk3OX0.897Th41AyzsIGYALaJfAbYXNuQn2YKLMgVJT4NruFYg'

export const trackPrice = async (args: any) => {
  await Moralis.start({
    apiKey,
  })

  const { strategy, ca } = args

  if (CA_DB[ca]) {
    clearInterval(CA_DB[ca].interval)
  }

  const composeHandler = (model) => async () => {
    try {
      const response = await Moralis.SolApi.token.getTokenPrice({
        network: 'mainnet',
        address: model.ca,
      })
      model.data = response.toJSON()
      model.price = model.data.usdPrice
      model.interval = setTimeout(model.handler, 1000)
      if (!model.startingPrice) {
        model.startingPrice = model.price
      }

      if (model.strategy(model)) {
        console.log('job complete for', `${model.data.name} (${model.data.symbol}) at ${model.price}`)
        clearInterval(model.interval)
        return
      }

      if (model.callback) {
        model.callback(model)
      }
    } catch (e) {
      console.error(e)
    }
  }

  CA_DB[ca] = {
    strategy,
    startingPrice: 0,
    price: 0,
    ca: ca,
    interval: 0,
    data: {},
    meta: (
      await Moralis.SolApi.token.getTokenMetadata({
        network: 'mainnet',
        address: ca,
      })
    ).toJSON(),
  }

  CA_DB[ca].handler = composeHandler(CA_DB[ca])

  CA_DB[ca].handler()

  return CA_DB[ca]
}

const tracker = await trackPrice({ ca: 'EszDmCQxSiGkBYF9QN1gWvY7yJornNcRUi2HPBYSpump', strategy: strategy2x })
tracker.callback = (response) => {
  console.log(response)
  // console.log(response.data.symbol, response.price)
}
