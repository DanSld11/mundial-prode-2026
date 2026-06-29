'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { propagateWinnersAction } from './actions'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

export default function PropagateButton() {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const res = await propagateWinnersAction()
      if ('error' in res) {
        toast.error(res.error as string)
      } else {
        toast.success(`Ganadores propagados (${res.propagated} partidos actualizados)`)
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 px-4 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Propagando...' : 'Propagar ganadores'}
    </button>
  )
}
