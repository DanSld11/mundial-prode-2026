'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Shield, Award } from 'lucide-react'
import { SEED_TEAMS } from '@/lib/seed-data'

interface StickerPreviewProps {
  player: any
  team: typeof SEED_TEAMS[number]
  quantity: number
  imageSrc: string | null
  onClose: () => void
}

function StickerPreviewModal({ player, team, quantity, imageSrc, onClose }: StickerPreviewProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.6, rotateY: -30, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.6, rotateY: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-[260px] sm:w-[320px]"
          onClick={(e) => e.stopPropagation()}
          style={{ perspective: 1000 }}
        >
          {/* Tarjeta principal */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-4 border-amber-400">
            {/* Efecto holográfico */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-white/30 to-cyan-500/10 pointer-events-none z-20 mix-blend-overlay animate-pulse" />
            
            {/* Cabecera con bandera y código */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{team?.flag_emoji}</span>
                <div>
                  <div className="text-amber-400 font-black text-sm uppercase tracking-wider">{team?.name}</div>
                  <div className="text-slate-400 text-xs">{team?.confederation}</div>
                </div>
              </div>
              <div className="bg-amber-400 text-slate-900 font-black text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                {player.shirt_number}
              </div>
            </div>

            {/* Imagen del jugador */}
            <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden" style={{ height: 280 }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-[200px]">{team?.flag_emoji}</span>
              </div>
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={player.name}
                  className="h-full object-contain object-bottom relative z-10 drop-shadow-2xl"
                  style={{ maxHeight: 260 }}
                />
              ) : (
                <div className="w-32 h-48 bg-slate-300 rounded-t-full flex items-center justify-center">
                  <span className="text-6xl text-slate-400">?</span>
                </div>
              )}
              {/* Badge "REPETIDA" */}
              {quantity > 1 && (
                <div className="absolute top-3 right-3 z-30 bg-brand-red text-white text-xs font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
                  ×{quantity} REPETIDAS
                </div>
              )}
            </div>

            {/* Pie con nombre y posición */}
            <div className="bg-white px-4 py-3 border-t-2 border-slate-200">
              <div className="text-center">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-tight">{player.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="bg-slate-900 text-amber-400 text-xs font-bold px-2 py-0.5 rounded uppercase">{player.position}</span>
                  {player.is_captain && (
                    <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Cap.
                    </span>
                  )}
                </div>
              </div>

              {/* Stats si existen */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {player.goals !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-lg font-black text-slate-900">{player.goals ?? '-'}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Goles</div>
                  </div>
                )}
                {player.caps !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-lg font-black text-slate-900">{player.caps ?? '-'}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Partidos</div>
                  </div>
                )}
                <div className="bg-amber-50 rounded-lg p-2 col-span-1">
                  <div className="text-lg font-black text-amber-600">#{player.shirt_number}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Dorsal</div>
                </div>
              </div>
            </div>

            {/* Barra inferior */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                FIFA WORLD CUP 2026
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Award className="w-3 h-3" />
                Panini
              </div>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-30 bg-white text-slate-900 hover:bg-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-colors border-2 border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Reflejo / sombra */}
          <div className="h-8 mx-4 mt-1 bg-gradient-to-b from-black/20 to-transparent rounded-full blur-md" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

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
  const [showPreview, setShowPreview] = useState(false)

  // Intentar jpg primero (comprimido), fallback a png
  const imagePath = index
    ? `/figuritas_extraidas/${team?.code}/figura_${index}.jpg`
    : null
  
  // Si hay error con jpg, intentar png
  const [triedJpg, setTriedJpg] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(imagePath)

  const handleImgError = () => {
    if (!triedJpg && imagePath) {
      // Intentar con PNG si JPG falla
      const pngPath = imagePath.replace('.jpg', '.png')
      setCurrentSrc(pngPath)
      setTriedJpg(true)
    } else {
      setImgError(true)
    }
  }

  const handleClick = () => {
    if (isOwned && !isNew) {
      setShowPreview(true)
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative aspect-[3/4] rounded-lg bg-white shadow-md transition-all duration-300 group
          ${isOwned && !isNew
            ? 'cursor-pointer hover:scale-110 hover:shadow-xl hover:z-20 hover:shadow-amber-500/30' 
            : isNew 
            ? 'cursor-default' 
            : 'opacity-50 cursor-not-allowed grayscale'
          }`
        }
      >
        {/* Badge repetidas */}
        {quantity > 1 && !isNew && (
          <div className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-lg z-20 border-2 border-white">
            {quantity}
          </div>
        )}

        {/* Borde brillante al hover si es poseída */}
        {isOwned && !isNew && (
          <div className="absolute inset-0 rounded-lg ring-0 group-hover:ring-2 group-hover:ring-amber-400 transition-all duration-300 z-10 pointer-events-none" />
        )}

        {/* Contenedor principal */}
        <div className={`w-full h-full relative overflow-hidden rounded-lg flex flex-col
          ${isOwned ? 'border border-slate-300' : 'border-2 border-dashed border-slate-300 bg-slate-100'}`}
        >
          {isOwned ? (
            <>
              {/* Efecto holográfico hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none mix-blend-overlay" />

              {/* Cabecera */}
              <div className="h-[18%] w-full bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-amber-500 flex justify-between items-center px-1.5 relative z-10 shrink-0">
                <span className="text-[9px] md:text-[11px] font-black text-amber-400 leading-none">{team?.code}</span>
                <span className="text-[8px] md:text-[10px] font-bold text-white bg-amber-500/30 px-1 py-0.5 rounded-sm">{player.shirt_number}</span>
              </div>

              {/* Cuerpo imagen */}
              <div className="flex-1 w-full bg-gradient-to-b from-slate-100 to-slate-200 relative flex items-end justify-center overflow-hidden">
                {/* Fondo escudo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
                  <span className="text-5xl md:text-7xl">{team?.flag_emoji}</span>
                </div>
                
                {currentSrc && !imgError ? (
                  <img 
                    src={currentSrc}
                    alt={player.name}
                    onError={handleImgError}
                    className="w-full h-full object-contain object-bottom relative z-10 drop-shadow-lg"
                  />
                ) : (
                  // Silueta de jugador estilizada
                  <div className="w-[70%] h-[80%] relative z-10 flex flex-col items-center justify-end pb-1">
                    <div className="w-[50%] aspect-square rounded-full bg-slate-400/60 mb-1" />
                    <div className="w-[80%] h-[50%] bg-slate-400/60 rounded-t-3xl" />
                  </div>
                )}
              </div>

              {/* Pie nombre */}
              <div className="h-[22%] w-full bg-white border-t-2 border-slate-200 flex flex-col items-center justify-center px-1 relative z-10 shrink-0">
                <span className="text-[8px] md:text-[10px] font-black text-slate-900 uppercase text-center leading-tight tracking-tighter truncate w-full text-center">
                  {player.name}
                </span>
                <span className="text-[6px] md:text-[8px] font-semibold text-slate-500 uppercase mt-0.5">
                  {player.position}
                </span>
              </div>

              {/* Indicador de clic */}
              {!isNew && (
                <div className="absolute bottom-0 inset-x-0 h-[4px] bg-gradient-to-r from-amber-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity z-30" />
              )}
            </>
          ) : (
            /* VACÍA - Silueta Panini */
            <div className="w-full h-full flex flex-col items-center justify-between py-2 relative bg-slate-50">
              {/* Línea superior decorativa */}
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              
              <div className="flex flex-col items-center justify-center flex-1 gap-1">
                {/* Silueta jugador */}
                <div className="flex flex-col items-center opacity-20">
                  <div className="w-8 md:w-10 aspect-square rounded-full bg-slate-400" />
                  <div className="w-12 md:w-14 h-10 md:h-12 bg-slate-400 rounded-t-2xl mt-0.5" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-slate-300 mt-1">{player.shirt_number}</span>
              </div>
              
              {/* Nombre tenue */}
              <span className="text-[7px] md:text-[9px] font-bold text-slate-300 uppercase text-center px-1 leading-tight">
                {player.name}
              </span>
              
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista previa */}
      {showPreview && (
        <StickerPreviewModal
          player={player}
          team={team}
          quantity={quantity}
          imageSrc={!imgError && currentSrc ? currentSrc : null}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}
