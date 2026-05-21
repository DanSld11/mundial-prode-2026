'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy}
      className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/70 hover:text-white transition">
      {copied ? <><Check className="h-3 w-3" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
    </button>
  )
}
