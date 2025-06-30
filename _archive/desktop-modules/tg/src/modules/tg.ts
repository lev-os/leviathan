import { getTdjson } from 'prebuilt-tdlib'
import * as tdl from 'tdl'

import { caScanner, tgMessages } from '../db/schema'
import { db } from '../db'
import type { Update } from 'tdlib-types'
import { extractSolanaContractAddress } from '../domain/util'
import { and, eq } from 'drizzle-orm'

export class TgBot {
  private client: tdl.Client
  private snipe: (params: any) => Promise<void>
  private filter

  constructor(args: any) {
    const { snipe, filter } = args
    this.snipe = snipe
    this.filter = filter

    // If libtdjson is not present in the system search paths, the path to the
    // libtdjson shared library can be set manually, e.g.:
    //   tdl.configure({ tdjson: '/usr/local/lib/libtdjson.dylib' })
    // The library directory can be set separate from the library name,
    // example to search for libtdjson in the directory of the current script:
    //   tdl.configure({ libdir: __dirname })

    // Instead of building TDLib yourself, the aforementioned prebuilt-tdlib can be
    // used as follows:
    //   const { getTdjson } = require('prebuilt-tdlib')
    //   tdl.configure({ tdjson: getTdjson() })
    tdl.configure({
      tdjson: getTdjson(),
    })

    this.client = tdl.createClient({
      apiId: 10418561, // Your api_id
      apiHash: '74cef0fab358a5efec2510d5b3728f81', // Your api_hash
    })

    this.client.on('error', console.error)
    // Passing apiId and apiHash is mandatory,
    // these values can be obtained at https://my.telegram.org/
  }

  public async init(): Promise<void> {
    // Aside of receiving responses to your requests, the server can push to you
    // events called "updates" which can be received as follows:
    this.client.on('update', async (update: Update) => {
      const { id: msg_id, sender_id, chat_id, content } = update.message || update.last_message || {}
      const text = content?.text?.text
      const type = update._ || 'unknown'

      const ignore = ['updateChatPosition', 'updateNewMessage']

      if (!ignore.includes(update._)) {
        // if (update._ !== 'updateNewMessage') {
        // console.log(update)
        // this.snipe(update)
      }

      if (!text || !msg_id) {
        return
      }

      const msgExists = await db
        .select()
        .from(tgMessages)
        .where(and(eq(tgMessages.msg_id, msg_id)))

      if (msgExists.length) {
        return
      }

      const ca = extractSolanaContractAddress(text)

      if (ca) {
        const existing = await db
          .select()
          .from(tgMessages)
          .where(eq(tgMessages.ca, ca))
          .groupBy((builder) => builder.chat_id || builder.sender_id)
        if (existing.length > 10) {
          console.log('')
          console.log('')
          console.log(ca)
          console.log('')
          console.log(existing.length)
          await db.insert(caScanner).values({
            ca,
            msg_id,
            chat_id,
            sender_id: sender_id?.user_id || sender_id?.chat_id,
            timestamp: Date.now(),
          })
        }

        // const groups = {}
        // for(const e of existing) {
        //  groups
        // }
      }

      await db.insert(tgMessages).values({
        msg_id,
        chat_id,
        ca,
        sender_id: sender_id?.user_id || sender_id?.chat_id,
        text,
        type,
        data: JSON.stringify(update),
        timestamp: Date.now(),
      })
    })

    // Log in to a Telegram account. By default, with no arguments, this function will
    // ask for phone number etc. in the console. Instead of logging in as a user,
    // it's also possible to log in as a bot using `client.loginAsBot('<TOKEN>')`.
    await this.client.login()

    // Invoke a TDLib method. The information regarding TDLib method list and
    // documentation is below this code block.
    const me = await this.client.invoke({ _: 'getMe' })
    console.log('My user:', me)

    // Invoke some other TDLib method.
    const chats = await this.client.invoke({
      _: 'loadChats',
      chat_list: null,
      limit: 10,
    })
    console.log('A part of my chat list:', chats)

    // Close the instance so that TDLib exits gracefully and the JS runtime can
    // finish the process.
    // await client.close()
  }
}
