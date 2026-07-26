import { CarrySource } from './sections/types'

export function getCarriedValue(carry: CarrySource, outputs: any): string | string[] | null {
  if (!outputs) return null
  const value = outputs[carry.key]

  if (value === undefined || value === null) {
    return null
  }

  if (Array.isArray(value)) {
    const activeItems = value.filter(item => item && String(item).trim() !== '')
    return activeItems.length > 0 ? activeItems : null
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null
  }

  return String(value)
}
