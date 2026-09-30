import { useEffect, useRef } from 'react'
import { Credentials, deleteNotification, receiveNotification } from '../api'
import { Aliases, ParsedMessage, parseNotification } from '../notifications'

const RETRY_DELAY = 3000

/** Long polling очереди GREEN-API: receiveNotification -> обработка -> deleteNotification. */
export function useNotifications(creds: Credentials, aliases: Aliases, onMessage: (m: ParsedMessage) => void) {
  // Актуальные значения читаем через ref, чтобы не перезапускать polling при каждом обновлении.
  const latest = useRef({ aliases, onMessage })
  latest.current = { aliases, onMessage }

  useEffect(() => {
    let stopped = false

    async function poll() {
      while (!stopped) {
        try {
          const n = await receiveNotification(creds)
          if (!n) continue
          if (import.meta.env.DEV) console.debug('[GREEN-API]', n.body.typeWebhook, n.body)
          const parsed = parseNotification(n, latest.current.aliases)
          if (parsed) latest.current.onMessage(parsed)
          await deleteNotification(creds, n.receiptId)
        } catch {
          await new Promise((r) => setTimeout(r, RETRY_DELAY))
        }
      }
    }

    poll()
    return () => {
      stopped = true
    }
  }, [creds])
}
