import { chatIdToPhone } from './api'

const GRADIENTS = [
  'linear-gradient(135deg,#ff48b6,#ff8a35)',
  'linear-gradient(135deg,#ffc93d,#ff832a)',
  'linear-gradient(135deg,#14e1d5,#03c722)',
  'linear-gradient(135deg,#08d7f3,#5398ff)',
  'linear-gradient(135deg,#bf97ff,#526eff)',
]

export const avatarGradient = (id: string) => GRADIENTS[Number(id.replace(/\D/g, '').slice(-2)) % GRADIENTS.length]
export const avatarLabel = (id: string) => chatIdToPhone(id).slice(-2)
