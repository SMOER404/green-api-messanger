// Единственное место, где описан формат обращения к GREEN-API.
// Формат сверен с https://green-api.com/v3/docs/api/ (MAX): личный чат — `{номер}@c.us`,
// а во входящих уведомлениях chatId числовой, поэтому чат определяем по senderPhoneNumber.

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

/** apiUrl инстанса: `https://{первые 4 цифры idInstance}.api.green-api.com` (точное значение показано в личном кабинете). */
export const defaultApiUrl = (idInstance: string) =>
  /^\d{4}/.test(idInstance.trim()) ? `https://${idInstance.trim().slice(0, 4)}.api.green-api.com` : 'https://api.green-api.com'

const endpoint = (c: Credentials, method: string, extra = '') =>
  `${c.apiUrl.replace(/\/$/, '')}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}${extra}`

export const phoneToChatId = (phone: string) => `${phone.replace(/\D/g, '')}@c.us`
export const chatIdToPhone = (chatId: string) => chatId.split('@')[0]

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`GREEN-API: HTTP ${res.status}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export const getStateInstance = (c: Credentials) =>
  request<{ stateInstance: string }>(endpoint(c, 'getStateInstance'))

export const sendMessage = (c: Credentials, chatId: string, message: string) =>
  request<{ idMessage: string }>(endpoint(c, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

export interface Notification {
  receiptId: number
  body: {
    typeWebhook: string
    timestamp: number
    idMessage?: string
    senderData?: { chatId: string; senderName?: string; senderPhoneNumber?: number | string }
    messageData?: {
      typeMessage: string
      textMessageData?: { textMessage: string }
      extendedTextMessageData?: { text: string }
    }
  }
}

export const receiveNotification = (c: Credentials) =>
  request<Notification | null>(endpoint(c, 'receiveNotification', '?receiveTimeout=5'))

export const deleteNotification = (c: Credentials, receiptId: number) =>
  request<{ result: boolean }>(endpoint(c, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })

export interface Settings {
  webhookUrl?: string
  incomingWebhook?: string
  outgoingWebhook?: string
  outgoingAPIMessageWebhook?: string
}

export const getSettings = (c: Credentials) => request<Settings>(endpoint(c, 'getSettings'))

// HTTP API: webhookUrl должен быть пустым. Настройки применяются в течение ~5 минут.
export const enableNotifications = (c: Credentials) =>
  request<{ saveSettings: boolean }>(endpoint(c, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      outgoingAPIMessageWebhook: 'yes',
    }),
  })

export const notificationsReady = (s: Settings) => !s.webhookUrl && s.incomingWebhook === 'yes'
