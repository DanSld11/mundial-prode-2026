'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Wallet, Gift, Package, Trophy, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAlbum } from './AlbumContext'
import { SEED_PLAYERS } from '@/lib/seed-players'
import { SEED_TEAMS as TEAMS } from '@/lib/seed-data'
import { getUserWallet, getSystemSettings, claimDailyPack, buyPack, getUserStickers } from '@/app/dashboard/album/actions'
import { PaniniSticker } from './PaniniSticker'

export function AlbumModal() {
  const { isOpen, closeAlbum } = useAlbum()
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const [wallet, setWallet] = useState<any>(null)
  const [packPrice, setPackPrice] = useState(100)
  const [stickers, setStickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [openingPack, setOpeningPack] = useState(false)
  const [newStickers, setNewStickers] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadData()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  async function loadData() {
    try {
      const [w, s, userStickers] = await Promise.all([
        getUserWallet(), getSystemSettings(), getUserStickers()
      ])
      setWallet(w)
      setPackPrice(s.packPrice)
      setStickers(userStickers)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const canClaimDaily = wallet?.last_daily_pack_date !== today

  async function handleClaimDaily() {
    try {
      setOpeningPack(true)
      const res = await claimDailyPack()
      if (res.error) { toast.error(res.error); setOpeningPack(false); return }
      setNewStickers(res.pack || [])
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado')
      setOpeningPack(false)
    }
  }

  async function handleBuyPack() {
    try {
      setOpeningPack(true)
      const res = await buyPack()
      if (res.error) { toast.error(res.error); setOpeningPack(false); return }
      setNewStickers(res.pack || [])
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado')
      setOpeningPack(false)
    }
  }

  function closePack() { setOpeningPack(false); setNewStickers([]) }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    const newPage = currentPage + newDirection
    if (newPage >= 0 && newPage <= TEAMS.length + 1) setCurrentPage(newPage)
  }

  if (!isOpen) return null

  const totalUniqueStickers = stickers.length
  const totalPlayersInGame = SEED_PLAYERS.length
  const progressPercentage = Math.round((totalUniqueStickers / totalPlayersInGame) * 100)
  const totalPages = TEAMS.length + 1

  const pageVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, rotateY: dir > 0 ? 25 : -25 }),
    center: { x: 0, opacity: 1, rotateY: 0, zIndex: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0, rotateY: dir < 0 ? 25 : -25, zIndex: 0 }),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      {/* Botón cerrar */}
      <button
        onClick={closeAlbum}
        className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-red-600 text-white p-2.5 rounded-full transition-all hover:scale-110 border border-white/20 backdrop-blur-sm"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Indicador de página */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-white/70 text-xs font-bold">
          {currentPage === 0 ? 'Portada' : currentPage === 1 ? 'Tienda' : TEAMS[currentPage - 2]?.name}
        </span>
        <span className="text-white/30 text-xs">·</span>
        <span className="text-amber-400 text-xs font-bold">{currentPage + 1}/{totalPages + 1}</span>
      </div>

      {/* Libro */}
      <div className="relative w-[98vw] max-w-[1800px] h-[90vh] max-h-[900px]" style={{ perspective: 1200 }}>
        
        {/* Botón anterior */}
        {currentPage > 0 && (
          <button
            onClick={() => paginate(-1)}
            className="absolute -left-3 sm:-left-14 top-1/2 -translate-y-1/2 z-[60] group bg-white/10 hover:bg-amber-500 text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/20 hover:scale-110 hover:border-amber-400"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}
        {currentPage <= totalPages && (
          <button
            onClick={() => paginate(1)}
            className="absolute -right-3 sm:-right-14 top-1/2 -translate-y-1/2 z-[60] group bg-white/10 hover:bg-amber-500 text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/20 hover:scale-110 hover:border-amber-400"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}

        {/* Contenedor de página */}
        <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.9)] border border-white/10">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 280, damping: 32 }, opacity: { duration: 0.2 }, rotateY: { duration: 0.4 } }}
              className="absolute w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >

              {/* ── PORTADA ── */}
              {currentPage === 0 && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#06091a] via-[#0d1b3e] to-[#06091a] relative overflow-hidden">
                  {/* Fondo decorativo */}
                  <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 50%, #C8102E 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #1a3a6e 0%, transparent 60%)' }} />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />
                  
                  {/* Estrellas decorativas */}
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-40"
                      style={{ top: `${10 + i * 7}%`, left: `${5 + (i % 3) * 30}%`, animationDelay: `${i * 0.3}s` }} />
                  ))}

                  <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">
                    {/* Logo / Título */}
                    <div className="flex flex-col items-center">
                      <div className="text-amber-400 text-sm font-bold tracking-[0.4em] uppercase mb-3 opacity-80">Colección Oficial</div>
                      <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase" style={{ textShadow: '0 0 40px rgba(200,16,46,0.6)' }}>
                        FIFA<br />
                        <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>WORLD</span>
                      </h1>
                      <div className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-yellow-600 leading-none">
                        2026
                      </div>
                    </div>

                    {/* Barra de progreso general */}
                    <div className="w-full max-w-sm bg-white/5 rounded-full p-3 border border-white/10 backdrop-blur-sm">
                      <div className="flex justify-between text-xs text-white/60 mb-2 font-bold">
                        <span>PROGRESO DEL ÁLBUM</span>
                        <span className="text-amber-400">{progressPercentage}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                        />
                      </div>
                      <div className="text-center text-white/40 text-xs mt-1.5">{totalUniqueStickers} de {totalPlayersInGame} figuritas</div>
                    </div>

                    <button
                      onClick={() => paginate(1)}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-900 font-black px-10 py-4 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 uppercase tracking-widest text-sm flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Abrir Álbum
                    </button>
                  </div>
                </div>
              )}

              {/* ── PÁGINA 1: TIENDA / DASHBOARD ── */}
              {currentPage === 1 && (
                <div className="w-full h-full bg-[#f8f5ee] overflow-y-auto relative">
                  {/* Lomo izquierdo */}
                  <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
                  
                  <div className="relative z-0 p-6 md:p-10 max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Centro de Colección</h2>
                        <p className="text-slate-500 font-medium">Gestiona tus sobres y monedas</p>
                      </div>
                      {/* Saldo */}
                      <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                          <Wallet className="h-5 w-5 text-slate-900" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-200/70 font-bold uppercase tracking-wider">Saldo</p>
                          <p className="text-2xl font-black text-amber-400">{(wallet?.coins || 0).toLocaleString()} 🪙</p>
                        </div>
                      </div>
                    </div>

                    {/* Progreso */}
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider">Progreso del Álbum</h3>
                        <span className="ml-auto text-amber-600 font-black">{progressPercentage}%</span>
                      </div>
                      <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)' }} />
                        </motion.div>
                      </div>
                      <p className="text-slate-400 text-xs mt-2 font-medium">{totalUniqueStickers} de {totalPlayersInGame} figuritas pegadas</p>
                    </div>

                    {/* Cards de sobres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Sobre diario */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#C8102E] to-[#8B0000] rounded-2xl p-6 shadow-xl text-white">
                        <div className="absolute -right-8 -top-8 opacity-10">
                          <Gift className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-5 h-5 text-red-300" />
                            <span className="text-red-200 text-xs font-bold uppercase tracking-wider">Gratis · Cada 24h</span>
                          </div>
                          <h3 className="text-2xl font-black uppercase mb-1">Sobre Diario</h3>
                          <p className="text-red-200 text-sm mb-5">7 figuritas aleatorias sin costo</p>
                          <Button
                            onClick={handleClaimDaily}
                            disabled={!canClaimDaily || openingPack}
                            className={`w-full font-black uppercase tracking-wide py-3 rounded-xl text-sm shadow-lg transition-all hover:scale-[1.02] ${
                              canClaimDaily
                                ? 'bg-amber-400 hover:bg-amber-300 text-red-900'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            {openingPack ? '⏳ Abriendo...' : canClaimDaily ? '🎁 ¡Abrir Gratis!' : '✓ Vuelve Mañana'}
                          </Button>
                        </div>
                      </div>

                      {/* Tienda */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl text-white">
                        <div className="absolute -right-8 -top-8 opacity-5">
                          <Package className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-5 h-5 text-amber-400" />
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tienda Panini</span>
                          </div>
                          <h3 className="text-2xl font-black uppercase text-amber-400 mb-1">Comprar Sobre</h3>
                          <p className="text-slate-400 text-sm mb-5">7 figuritas a cambio de tus monedas</p>
                          <Button
                            onClick={handleBuyPack}
                            disabled={(wallet?.coins || 0) < packPrice || openingPack}
                            className="w-full font-black uppercase tracking-wide py-3 rounded-xl text-sm bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-slate-900 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                          >
                            {openingPack ? '⏳ Abriendo...' : `💰 Comprar × ${packPrice} coins`}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Equipo de inicio rápido */}
                    <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Ir a equipo</p>
                      <div className="flex flex-wrap gap-2">
                        {TEAMS.slice(0, 10).map((team, i) => (
                          <button key={team.code} onClick={() => setCurrentPage(i + 2)}
                            className="flex items-center gap-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition-all hover:text-amber-700"
                          >
                            <span>{team.flag_emoji}</span>
                            <span>{team.code}</span>
                          </button>
                        ))}
                        <button onClick={() => paginate(1)}
                          className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all"
                        >
                          Ver todos →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PÁGINAS DE EQUIPO ── */}
              {currentPage >= 2 && currentPage <= totalPages && (() => {
                const teamIndex = currentPage - 2
                const team = TEAMS[teamIndex]
                if (!team) return null

                const teamPlayers = SEED_PLAYERS.filter(p => p.team_code === team.code)
                const teamStickers = stickers.filter(s => s.team_code === team.code)
                const teamProgress = Math.round((teamStickers.length / Math.max(teamPlayers.length, 1)) * 100)

                return (
                  <div className="w-full h-full flex flex-col bg-[#f8f5ee] overflow-hidden">
                    {/* Lomo */}
                    <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-black/20 via-black/8 to-transparent z-10 pointer-events-none" />
                    
                    {/* Cabecera del equipo */}
                    <div className="shrink-0 relative bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 md:px-10 py-4 border-b-4 border-amber-500">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl md:text-6xl">{team.flag_emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter truncate">{team.name}</h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded uppercase">{team.code}</span>
                            <span className="text-slate-400 text-xs font-bold">{team.confederation}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-3xl md:text-5xl font-black text-amber-400">{teamStickers.length}<span className="text-slate-600 text-xl">/{teamPlayers.length}</span></div>
                          <div className="text-slate-400 text-xs font-bold uppercase">{teamProgress}% completo</div>
                        </div>
                      </div>
                      {/* Barra de progreso del equipo */}
                      <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${teamProgress}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-amber-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Grilla de figuritas */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3 md:gap-4 pb-6">
                        {teamPlayers.map((player, index) => {
                          const ownedSticker = stickers.find(s => s.player_name === player.name && s.team_code === team.code)
                          return (
                            <PaniniSticker
                              key={player.name}
                              player={player}
                              team={team}
                              quantity={ownedSticker?.quantity || 0}
                              index={index + 1}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── OVERLAY: ANIMACIÓN DE SOBRE ── */}
      <AnimatePresence>
        {openingPack && newStickers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-lg"
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-3xl md:text-5xl font-black text-amber-400 tracking-widest uppercase" style={{ textShadow: '0 0 30px rgba(245,158,11,0.7)' }}>
                ¡Nuevas Figuritas!
              </h2>
              <p className="text-slate-400 mt-1 font-medium">Haz clic en cualquier figurita para verla de cerca</p>
            </motion.div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-5xl">
              {newStickers.map((sticker, idx) => {
                const stickerTeam = TEAMS.find(t => t.code === sticker.team_code)
                const teamPlayers = SEED_PLAYERS.filter(p => p.team_code === sticker.team_code)
                const rawIdx = teamPlayers.findIndex(p => p.name === sticker.name || p.name === sticker.player_name)
                const stickerIndex = rawIdx >= 0 ? rawIdx + 1 : 1

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 100, rotate: Math.random() * 30 - 15 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    transition={{ type: 'spring', delay: idx * 0.12, duration: 0.7 }}
                    className="w-28 sm:w-32"
                  >
                    <PaniniSticker
                      player={{ ...sticker, name: sticker.name || sticker.player_name }}
                      team={stickerTeam as any}
                      quantity={1}
                      isNew={true}
                      index={stickerIndex}
                    />
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-10"
            >
              <Button
                onClick={closePack}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-black text-lg px-12 py-6 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 transition-all uppercase tracking-wider"
              >
                ✅ Pegar en el Álbum
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
