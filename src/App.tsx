import { useEffect, useState } from 'react'
import { Credentials } from './api'
import Login from './components/Login'
import Chat from './components/Chat'

const KEY = 'max-chat:credentials'

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (creds) localStorage.setItem(KEY, JSON.stringify(creds))
    else localStorage.removeItem(KEY)
  }, [creds])

  return creds ? <Chat creds={creds} onLogout={() => setCreds(null)} /> : <Login onLogin={setCreds} />
}
