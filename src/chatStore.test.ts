import { describe, expect, it } from 'vitest'
import { appendMessage, mergeChats, resolveTarget } from './chatStore'
import { ParsedMessage } from './notifications'
import { Chats } from './types'

const msg = (id: string, time = 1) => ({ id, text: id, out: true, time })
const parsed = (chatId: string, id: string): ParsedMessage => ({ chatId, rawChatId: '385998320', message: msg(id) })

describe('resolveTarget', () => {
  it('эхо API-сообщения попадает в чат, откуда оно было отправлено', () => {
    const chats: Chats = { '79001234567@c.us': [msg('M1')] }
    expect(resolveTarget(chats, parsed('385998320', 'M1'))).toBe('79001234567@c.us')
  })
  it('незнакомое сообщение остаётся в своём chatId', () => {
    expect(resolveTarget({ a: [msg('M1')] }, parsed('385998320', 'M2'))).toBe('385998320')
  })
})

describe('mergeChats', () => {
  it('переносит сообщения без дублей и удаляет старый чат', () => {
    const chats: Chats = { '385998320': [msg('a', 1), msg('b', 3)], '7@c.us': [msg('b', 3), msg('c', 2)] }
    const res = mergeChats(chats, '385998320', '7@c.us')
    expect(Object.keys(res)).toEqual(['7@c.us'])
    expect(res['7@c.us'].map((m) => m.id)).toEqual(['a', 'c', 'b'])
  })
  it('ничего не делает, если чата-источника нет', () => {
    const chats: Chats = { x: [] }
    expect(mergeChats(chats, 'nope', 'x')).toBe(chats)
  })
})

describe('appendMessage', () => {
  it('не добавляет дубль по id', () => {
    const chats: Chats = { x: [msg('a')] }
    expect(appendMessage(chats, 'x', msg('a'))).toBe(chats)
  })
})
