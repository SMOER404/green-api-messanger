import { FormEvent, useState } from 'react'
import { Credentials, DEFAULT_API_URL, getStateInstance } from '../api'

export default function Login({ onLogin }: { onLogin: (c: Credentials) => void }) {
  const [idInstance, setId] = useState('')
  const [apiTokenInstance, setToken] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const creds = { idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim(), apiUrl: apiUrl.trim() }
    setBusy(true)
    setError('')
    try {
      const { stateInstance } = await getStateInstance(creds)
      if (stateInstance !== 'authorized') throw new Error(`Инстанс не авторизован (${stateInstance})`)
      onLogin(creds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось подключиться')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>GREEN-API Chat</h1>
        <p className="hint">Введите данные инстанса GREEN-API</p>
        <input placeholder="idInstance" value={idInstance} onChange={(e) => setId(e.target.value)} required />
        <input
          placeholder="apiTokenInstance"
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <input placeholder="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy}>{busy ? 'Проверка…' : 'Войти'}</button>
      </form>
    </div>
  )
}
