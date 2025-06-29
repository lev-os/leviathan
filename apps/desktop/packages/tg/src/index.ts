import { LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import { SolBot } from './modules/bot'
import dotenv from 'dotenv'
import { TgBot } from './modules/tg'
import fs from 'fs'
import type { Update } from 'tdlib-types'
import config from '../config.json'
import { strategy2x } from './modules/bot-strategy'
import { SwapToken } from './domain/domain'
import { createConsola } from 'consola'
import pinoConfig from 'pino'
import Axe from 'axe'

const pino = pinoConfig({
  customLevels: {
    log: 30,
    success: 30,
  },
  hooks: {
    // <https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod>
    logMethod(inputArgs, method) {
      return method.call(
        this,
        JSON.stringify({
          // <https://github.com/pinojs/pino/issues/854>
          // message: inputArgs[0],
          msg: inputArgs[0],
          meta: inputArgs[1],
        })
      )
    },
  },
})

const consola = createConsola({
  formatOptions: {
    compact: true,
  },
  level: parseInt(process.env.LOG_LEVEL || '5'),
})

type Commands = 'scanForContract' | 'watchChannel'
type Config = {
  triggers: { user_id?: number; chat_id?: number; phrase?: string; name: string; cmd?: Commands }[]
  rpid: number
  muscle: number
  targetLounges: string[]
}

let typedConfig: Config = config

dotenv.config({
  path: '.env',
})

const defaultConfig = {
  solanaEndpoint: clusterApiUrl('mainnet-beta'),
  jupiter: 'https://quote-api.jup.ag/v6',
}

async function main() {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable not set')
  }
  let decodedSecretKey = Uint8Array.from(JSON.parse(process.env.SECRET_KEY))

  const isProduction = process.env.NODE_ENV === 'production'

  const logger = new Axe({
    logger: isProduction ? pino : consola,
    levels: ['info', 'warn', 'error', 'fatal', 'success'],
    appInfo: false,
    meta: {
      show: false,
    },
  })

  logger.info('Config', config)

  const bot = new SolBot({
    solanaEndpoint: process.env.SOLANA_ENDPOINT ?? defaultConfig.solanaEndpoint,
    metisEndpoint: process.env.METIS_ENDPOINT ?? defaultConfig.jupiter,
    secretKey: decodedSecretKey,
    logger,
  })

  await bot.init({ moralisApiKey: process.env.MORALIS_API_KEY! })

  bot.addTrade({
    antiMEV: true,
    swapWith: SwapToken.SOL,
    buyAmount: 10 * LAMPORTS_PER_SOL,
    mint: '8PVFdKx7fX1FmmoASfTu5CUPEWuD1WY73Z24UTgCpump',
    strategy: [strategy2x],
    numTokens: 4841174169054,
    startingPrice: 0,
    price: 0,
  })

  return

  // -1002020773267     paris private

  const tg = new TgBot({
    snipe: (m: Update) => {
      const sender = m?.message?.sender_id?.user_id
      const chat = m?.message?.chat_id

      if (!sender && !chat) {
        return
      }

      const senderMatch = typedConfig.triggers.find((f) => f.user_id === sender || f.chat_id === chat)
      const triggerMatch = senderMatch?.phrase && m?.message?.content?.text?.text?.includes?.(senderMatch.phrase)

      const cmd = triggerMatch && senderMatch?.cmd
      const watchMatch = config.channels?.includes(chat)

      if (cmd === 'scanForContract') {
        console.log('scanForContract')
      } else if (cmd === 'watchChannel') {
        console.log('watchChannel')
        watchChannel(chat)
      }

      if (senderMatch) {
        console.log(senderMatch)
        console.log(m?.message?.content?.text)
        console.log(m)
      }

      // console.log(m?.message?.content?.text)

      if (senderMatch?.phrase && m?.message?.content?.text?.text?.includes?.(senderMatch.phrase)) {
        console.log(`${senderMatch.name} phrase detected: ${senderMatch.phrase}`)
        // console.log(`${senderMatch.name} phrase detected: ${senderMatch.phrase}`)
        // fs.writeFileSync(path.join('data', `${m.message.id.toString()}.json`), JSON.stringify(m, null, 2))
      }

      if (m._ === 'updateNewMessage') {
        if (m.message.content._ === 'messageText') {
          // console.log(m.message.content.text)
        }
      }
      // if (!!m.match(/paris/i)) {
      //   console.log('Paris detected')
      // }
    },
  })

  await tg.init()

  // tg.client.invoke({ _: 'getChats' })
}

const watchChannel = async (chatId: number) => {
  const newConfig = { ...config }
  newConfig.channels = newConfig.channels ?? []
  if (newConfig.channels.includes(chatId)) {
    return
  }
  newConfig.channels.push(chatId)
  typedConfig = newConfig
  fs.writeFileSync('config.json', JSON.stringify(newConfig))
}

main().catch(console.error)
