import type { StrategyCallbackArgs, Strategy } from '../domain/domain'

// TODO: UI-based strategy builder
// step1: make these configuration/yaml driven
// step2: store in db
// step3: crud
export const strategy2x: Strategy = {
  label: '2x',
  callback: function s2x(args: StrategyCallbackArgs) {
    const { bot, quote, trade, difference, isNegative, formatted } = args

    if (trade.lastQuote?.outAmount === undefined) {
      return false
    }

    console.log({ p: trade.price, sp: trade.startingPrice, difference, formatted, isNegative })

    // 2x
    if (trade.price >= trade.startingPrice * 2) {
      console.log('Price is 2x')
      return true
    }

    // 20% stop loss
    if (trade.price <= trade.startingPrice - trade.startingPrice * 0.2) {
      console.log('Stopped out at 20% loss')
    }

    return false
  },
}
