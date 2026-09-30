export interface Message {
  id: string
  text: string
  out: boolean
  time: number
}

export type Chats = Record<string, Message[]>
