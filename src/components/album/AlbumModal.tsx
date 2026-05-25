'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Wallet, Gift, Package, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  // Data states
  const [wallet, setWallet] = useState<any>(null)
  const [packPrice, setPackPrice] = useState(100)
  const [stickers, setStickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pack states
  const [openingPack, setOpeningPack] = useState(false)
  const [newStickers, setNewStickers] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadData()
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  async function loadData() {
    try {
      const [w, s, userStickers] = await Promise.all([
        getUserWallet(),
        getSystemSettings(),
        getUserStickers()
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
      const pack = await claimDailyPack()
      setNewStickers(pack)
      await loadData()
    } catch (error: any) {
      toast.error(error.message)
      setOpeningPack(false)
    }
  }

  async function handleBuyPack() {
    try {
      setOpeningPack(true)
      const pack = await buyPack()
      setNewStickers(pack)
      await loadData()
    } catch (error: any) {
      toast.error(error.message)
      setOpeningPack(false)
    }
  }

  function closePack() {
    setOpeningPack(false)
    setNewStickers([])
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    const newPage = currentPage + newDirection
    if (newPage >= 0 && newPage <= TEAMS.length + 1) {
      setCurrentPage(newPage)
    }
  }

  if (!isOpen) return null

  // Calculate progress
  const totalUniqueStickers = stickers.length
  const totalPlayersInGame = SEED_PLAYERS.length
  const progressPercentage = Math.round((totalUniqueStickers / totalPlayersInGame) * 100)

  // Pagination logic
  const totalPages = TEAMS.length + 1 // 0: Cover, 1: Shop, 2..49: Teams
  
  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      {/* Cierre */}
      <button 
        onClick={closeAlbum} 
        className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-brand-red text-white p-2 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Contenedor Principal del Libro */}
      <div className="relative w-[98vw] max-w-[1800px] aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] perspective-1000 max-h-[95vh]">
        {/* Controles de paginación */}
        {currentPage > 0 && (
          <button 
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 z-[60] bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        
        {currentPage <= totalPages && (
          <button 
            onClick={() => paginate(1)}
            className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 z-[60] bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <div className="w-full h-full relative overflow-hidden rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-700">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.4 }
              }}
              className="absolute w-full h-full bg-slate-100 flex shadow-inner"
              style={{ transformStyle: 'preserve-3d' }}
            >
              
              {/* PAGE 0: COVER */}
              {currentPage === 0 && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c1a40] via-[#1a365d] to-[#0c1a40] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-red rounded-full blur-3xl opacity-20"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center px-4">
                    <img src="/icons/icon-192.png" alt="Logo" className="w-32 h-32 mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-xl tracking-tighter uppercase mb-4">
                      FIFA WORLD CUP<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">2026</span>
                    </h1>
                    <p className="text-amber-400 font-bold tracking-[0.3em] uppercase text-sm md:text-xl border-t border-b border-amber-500/30 py-2">
                      Official Sticker Collection
                    </p>
                    
                    <button onClick={() => paginate(1)} className="mt-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 uppercase tracking-widest text-sm">
                      Abrir Álbum
                    </button>
                  </div>
                </div>
              )}

              {/* PAGE 1: DASHBOARD / SHOP */}
              {currentPage === 1 && (
                <div className="w-full h-full p-4 md:p-8 overflow-y-auto bg-slate-50 relative">
                  <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/20 to-transparent"></div> {/* Sombra del lomo */}
                  
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
                      <div>
                        <h2 className="text-2xl font-black text-amber-400 uppercase">Centro de Colección</h2>
                        <p className="text-slate-300">Monedas y Progreso</p>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-slate-700/50">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                          <Wallet className="h-6 w-6 text-slate-900" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-200/70 font-bold uppercase tracking-wider">Saldo Total</p>
                          <p className="text-2xl font-black text-amber-400">{wallet?.coins || 0}</p>
                        </div>
                      </div>
                    </div>

                    <Card className="border-0 shadow-xl bg-white">
                      <CardContent className="p-6">
                        <h3 className="font-black text-lg mb-4 text-slate-800 uppercase flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-amber-500" /> 
                          Progreso del Álbum
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold text-slate-600">
                            <span>{totalUniqueStickers} / {totalPlayersInGame} Pegadas</span>
                            <span className="text-amber-600">{progressPercentage}% Completo</span>
                          </div>
                          <div className="h-6 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-1000 relative"
                              style={{ width: `${progressPercentage}%` }}
                            >
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-brand-red to-red-800 text-white overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 text-white/10">
                          <Gift className="w-48 h-48" />
                        </div>
                        <CardContent className="p-8 flex flex-col items-center text-center relative z-10 space-y-4">
                          <h3 className="font-black text-2xl uppercase">Sobre Diario Gratis</h3>
                          <p className="text-red-100">Reclama 1 sobre de 7 figuritas cada 24 horas.</p>
                          <Button 
                            onClick={handleClaimDaily} 
                            disabled={!canClaimDaily || openingPack}
                            size="lg"
                            className={`w-full font-bold uppercase tracking-wider shadow-xl ${canClaimDaily ? 'bg-amber-400 hover:bg-amber-500 text-red-900' : 'bg-red-900/50 text-red-300'}`}
                          >
                            {canClaimDaily ? '¡Abrir Gratis Ahora!' : 'Vuelve Mañana'}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 text-white/5">
                          <Package className="w-48 h-48" />
                        </div>
                        <CardContent className="p-8 flex flex-col items-center text-center relative z-10 space-y-4">
                          <h3 className="font-black text-2xl uppercase text-amber-400">Tienda Panini</h3>
                          <p className="text-slate-300">Compra más sobres usando tus Monedas.</p>
                          <Button 
                            onClick={handleBuyPack} 
                            disabled={wallet?.coins < packPrice || openingPack}
                            size="lg"
                            className="w-full font-bold uppercase tracking-wider bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          >
                            Comprar x {packPrice} 🪙
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGES 2+: TEAMS */}
              {currentPage >= 2 && currentPage <= totalPages && (() => {
                const teamIndex = currentPage - 2
                const team = TEAMS[teamIndex]
                if (!team) return null

                const teamPlayers = SEED_PLAYERS.filter(p => p.team_code === team.code)
                const teamStickers = stickers.filter(s => s.team_code === team.code)

                return (
                  <div className="w-full h-full p-4 md:p-8 lg:p-12 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/paper.png')] bg-white relative">
                    <div className="absolute top-0 left-0 w-8 md:w-16 h-full bg-gradient-to-r from-black/20 to-transparent"></div> {/* Sombra del lomo */}
                    
                    {/* Cabecera de Página de Equipo */}
                    <div className="flex items-center gap-4 md:gap-8 mb-8 md:mb-12 border-b-4 border-slate-900 pb-4">
                      <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-slate-900 flex items-center justify-center text-4xl md:text-6xl lg:text-7xl rounded shadow-lg border-2 border-amber-500">
                        {team.flag_emoji}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter">{team.name}</h2>
                        <div className="flex items-center gap-2 mt-1 md:mt-2">
                          <span className="bg-slate-900 text-amber-400 text-xs md:text-sm font-bold px-2 py-1 uppercase rounded">{team.code}</span>
                          <span className="text-slate-500 font-bold text-sm md:text-lg">{team.confederation}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm md:text-lg font-bold text-slate-500 uppercase">Completado</div>
                        <div className="text-2xl md:text-5xl font-black text-brand-red">{teamStickers.length}/{teamPlayers.length}</div>
                      </div>
                    </div>

                    {/* Grilla de Figuritas */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6 lg:gap-8 pb-12">
                      {teamPlayers.map(player => {
                        const ownedSticker = stickers.find(s => s.player_name === player.name && s.team_code === team.code)
                        return (
                          <PaniniSticker 
                            key={player.name} 
                            player={player} 
                            team={team} 
                            quantity={ownedSticker?.quantity || 0} 
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* OVERLAY: ABRIR SOBRE ANIMACIÓN */}
      <AnimatePresence>
        {openingPack && newStickers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            <h2 className="text-3xl md:text-5xl font-black text-amber-400 mb-12 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">¡NUEVAS FIGURITAS!</h2>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
              {newStickers.map((sticker, idx) => {
                const stickerTeam = TEAMS.find(t => t.code === sticker.team_code)
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 200, rotationY: 180 }}
                    animate={{ scale: 1, y: 0, rotationY: 0 }}
                    transition={{ type: 'spring', delay: idx * 0.15, duration: 0.8 }}
                    className="relative perspective-1000"
                  >
                    <PaniniSticker 
                      player={sticker} 
                      team={stickerTeam as any} 
                      quantity={1} 
                      isNew={true}
                    />
                  </motion.div>
                )
              })}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1.5 }}
              className="mt-16"
            >
              <Button onClick={closePack} size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-black text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 transition-all">
                PEGAR EN EL ÁLBUM
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
