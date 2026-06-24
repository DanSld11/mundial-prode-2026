export interface SlotDef {
  id: number
  type: 'points' | 'retry' | 'nothing'
  value: number
  color: string
}

export function slotLabel(slot: SlotDef): string {
  if (slot.type === 'points') return slot.value > 0 ? `+${slot.value} pts` : `${slot.value} pts`
  if (slot.type === 'retry') return 'Otra vez'
  return 'Piña 🍍'
}
