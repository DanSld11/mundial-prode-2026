'use client'

import { useState } from 'react'
import { SEED_TEAMS } from '@/lib/seed-data'

export function PaniniSticker({ 
  player, 
  team, 
  quantity,
  isNew = false,
  index 
}: { 
  player: any
  team: typeof SEED_TEAMS[number]
  quantity: number
  isNew?: boolean
  index?: number
}) {
  const isOwned = quantity > 0 || isNew
  
  const [imgError, setImgError] = useState(false)
  // Utilizamos las imágenes extraídas usando el índice de la figurita
  const imagePath = `/figuritas_extraidas/${team?.code}/figura_${index}.png`

  return (
    <div className={`relative aspect-[3/4] rounded-sm bg-white p-1 md:p-1.5 shadow-sm transition-transform duration-300 ${isOwned ? 'hover:scale-105 z-10 cursor-pointer shadow-md' : 'opacity-60 cursor-not-allowed'}`}>
      
      {/* Etiqueta de repetidas */}
      {quantity > 1 && !isNew && (
        <div className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-black h-6 w-6 flex items-center justify-center rounded-full shadow-lg z-20 border-2 border-white">
          {quantity}
        </div>
      )}

      {/* Contenedor principal de la figurita */}
      <div className={`w-full h-full relative overflow-hidden border ${isOwned ? 'border-slate-300' : 'border-dashed border-slate-300 bg-slate-100'} rounded-sm flex flex-col`}>
        
        {isOwned ? (
          <>
            {/* Efecto Holográfico / Brillante (Si es isNew o si queremos hacerlo para todos) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none mix-blend-overlay"></div>

            {/* Cabecera de la figurita (Bandera y Número) */}
            <div className="h-[15%] w-full bg-slate-900 border-b border-amber-500/50 flex justify-between items-center px-1.5 relative z-10">
              <span className="text-[10px] md:text-xs font-black text-amber-400">{team?.code}</span>
              <span className="text-[10px] md:text-xs font-black text-white bg-white/20 px-1 rounded-sm">{player.shirt_number}</span>
            </div>

            {/* Cuerpo (Imagen o Silueta a color) */}
            <div className="flex-1 w-full bg-gradient-to-b from-slate-200 to-slate-300 relative flex items-end justify-center overflow-hidden">
              {/* Fondo del equipo (Escudo gigante semitransparente) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="text-6xl md:text-8xl">{team?.flag_emoji}</span>
              </div>
              
              {/* Imagen del jugador */}
              {!imgError ? (
                <img 
                  src={imagePath} 
                  alt={player.name}
                  onError={() => setImgError(true)}
                  className="w-[90%] h-[90%] object-contain object-bottom relative z-10 drop-shadow-xl"
                />
              ) : (
                <div className="w-[80%] h-[80%] bg-slate-400 rounded-t-[40%] relative z-10 opacity-80 flex items-center justify-center">
                   <span className="text-4xl text-slate-500">?</span>
                </div>
              )}
            </div>

            {/* Pie (Nombre) */}
            <div className="h-[20%] w-full bg-white border-t border-slate-200 flex flex-col items-center justify-center px-1 relative z-10">
              <span className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase text-center leading-tight tracking-tighter truncate w-full">
                {player.name}
              </span>
              <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase">
                {player.position}
              </span>
            </div>
          </>
        ) : (
          /* DISEÑO CUANDO NO LA TIENES (Silueta Vacía) */
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] bg-slate-50">
            <span className="text-3xl md:text-4xl font-black text-slate-200 mb-2">{player.shirt_number}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase text-center px-2">{player.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
