# GREEN-API Chat

Минимальный веб-чат для отправки и получения текстовых сообщений через [GREEN-API](https://green-api.com).
Работает с инстансами MAX и Telegram (у них одинаковый формат API). Внешний вид — по мотивам [web.max.ru](https://web.max.ru/).

React 18 · TypeScript · Vite · vitest

## Локальный запуск

Нужен Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
```

Другие команды:

```bash
npm test         # unit-тесты (vitest)
npm run build    # production-сборка в dist/
npm run preview  # локальный просмотр сборки
```

## Как пользоваться

1. Создайте инстанс в [личном кабинете GREEN-API](https://console.green-api.com) и авторизуйте его (QR-код или вход в аккаунт).
2. Откройте приложение и введите `idInstance` и `apiTokenInstance`. Поле `apiUrl` менять не нужно, если кабинет не указывает другой адрес.
3. Если приём сообщений выключен в настройках инстанса, сверху появится плашка с кнопкой **«Включить»**. Она выставляет `incomingWebhook=yes`, `outgoingWebhook=yes`, `outgoingAPIMessageWebhook=yes` и пустой `webhookUrl`. GREEN-API применяет настройки в течение ~5 минут.
4. Введите номер получателя в международном формате без `+` (например, `79001234567`) и нажмите «+» — создастся чат.
5. Пишите сообщения. Ответы получателя появляются в чате автоматически.

Для Telegram писать по номеру можно только тем, кто есть в контактах аккаунта инстанса.

## Как это работает

| Действие | Метод GREEN-API |
|---|---|
| Проверка входа | `getStateInstance` |
| Отправка | `POST sendMessage` (`chatId`, `message`) |
| Получение | `GET receiveNotification?receiveTimeout=5`, затем `DELETE deleteNotification/{receiptId}` |
| Настройки приёма | `getSettings`, `setSettings` |

Приём построен на HTTP API (long polling): приложение в цикле запрашивает очередь уведомлений, разбирает текстовые сообщения и удаляет обработанные уведомления.

В MAX и Telegram во входящих уведомлениях `chatId` числовой, а чат создаётся по номеру (`79001234567@c.us`). Поэтому чаты связываются через `senderPhoneNumber`, а эхо сообщений, отправленных через API, — по `idMessage`.

## Структура

```
src/
  api.ts                     все запросы к GREEN-API (формат URL и chatId)
  notifications.ts           разбор уведомления в сообщение чата (parseNotification)
  chatStore.ts               чистые функции над чатами: склейка, дедупликация
  hooks/
    useNotifications.ts      polling очереди уведомлений
    useChats.ts              чаты, имена, соответствие chatId
    useNotificationSettings.ts  проверка и включение приёма
    useLocalStorage.ts
  components/
    Login.tsx  Chat.tsx  ChatList.tsx  Conversation.tsx
```

## Хранение данных

`idInstance`, `apiTokenInstance` и история чатов хранятся только в `localStorage` браузера, на сервер приложения ничего не отправляется (сервера нет). Запросы уходят напрямую в GREEN-API из браузера.

## Ограничения

- Только текстовые сообщения (по условию задания).
- История не запрашивается у GREEN-API: чат содержит сообщения, отправленные и полученные, пока приложение открыто.
- Полученные, пока приложение закрыто, доходят при следующем открытии: GREEN-API хранит очередь уведомлений 24 часа.
