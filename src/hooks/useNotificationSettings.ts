import { useEffect, useState } from 'react'
import { Credentials, enableNotifications, getSettings, notificationsReady } from '../api'

export type SettingsState = 'ok' | 'off' | 'applying'

/** Проверяет, что инстанс настроен на приём через HTTP API, и умеет включить это. */
export function useNotificationSettings(creds: Credentials) {
  const [state, setState] = useState<SettingsState>('ok')
  const [error, setError] = useState('')

  useEffect(() => {
    getSettings(creds)
      .then((s) => setState(notificationsReady(s) ? 'ok' : 'off'))
      .catch(() => {})
  }, [creds])

  const enable = async () => {
    try {
      await enableNotifications(creds)
      setState('applying')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
    }
  }

  return { state, error, enable }
}
