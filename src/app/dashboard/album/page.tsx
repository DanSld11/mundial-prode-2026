'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Gift, Package, ArrowLeft, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { getUserWallet, getSystemSettings, claimDailyPack, buyPack, getUserStickers } from './actions'
import { SEED_PLAYERS } from '@/lib/seed-players'
import { TEAMS } from '@/lib/seed-data'

export default function AlbumPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [packPrice, setPackPrice] = useState(100)
  const [stickers, setStickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openingPack, setOpeningPack] = useState(false)
  const [newStickers, setNewStickers] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

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
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
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
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      setOpeningPack(false)
    }
  }

  function closePack() {
    setOpeningPack(false)
    setNewStickers([])
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Cargando tu álbum...</div>
  }

  // Calculate progress
  const totalUniqueStickers = stickers.length
  const totalPlayersInGame = SEED_PLAYERS.length
  const progressPercentage = Math.round((totalUniqueStickers / totalPlayersInGame) * 100)

  return (
    <div className="space-y-6">
      {/* Header & Wallet */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Álbum Digital Qatar 2026
          </h1>
          <p className="text-slate-300 mt-1">Colecciona las {totalPlayersInGame} figuritas de los jugadores.</p>
        </div>

        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-200/70 font-semibold uppercase tracking-wider">Tus Monedas</p>
              <p className="text-xl font-black text-amber-400">{wallet?.coins || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Shop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-background to-muted/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-brand-red" /> 
              Tu Progreso
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{totalUniqueStickers} / {totalPlayersInGame}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-red to-red-500 transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gradient-to-br from-background to-muted/50 border-border/50">
          <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-around items-center">
            
            <div className="text-center space-y-3">
              <div className="h-20 w-16 mx-auto bg-gradient-to-tr from-amber-200 to-yellow-500 rounded-lg shadow-lg flex items-center justify-center transform rotate-[-5deg] hover:rotate-0 transition-transform">
                <Gift className="text-amber-900 h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-lg">Sobre Diario Gratis</p>
                <p className="text-sm text-muted-foreground">¡1 sobre cada día!</p>
              </div>
              <Button 
                onClick={handleClaimDaily} 
                disabled={!canClaimDaily || openingPack}
                className={canClaimDaily ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
              >
                {canClaimDaily ? 'Reclamar Gratis' : 'Vuelve mañana'}
              </Button>
            </div>

            <div className="w-px h-24 bg-border hidden md:block"></div>

            <div className="text-center space-y-3">
              <div className="h-20 w-16 mx-auto bg-gradient-to-tr from-slate-700 to-slate-900 border-2 border-amber-500/50 rounded-lg shadow-lg flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform">
                <Package className="text-amber-400 h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-lg">Comprar Sobre</p>
                <p className="text-sm text-muted-foreground">{packPrice} Monedas</p>
              </div>
              <Button 
                onClick={handleBuyPack} 
                disabled={wallet?.coins < packPrice || openingPack}
                variant="outline"
                className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              >
                Comprar por {packPrice} 🪙
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Selecciones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {TEAMS.map(team => {
            const teamStickers = stickers.filter(s => s.team_code === team.code)
            const teamPlayers = SEED_PLAYERS.filter(p => p.team_code === team.code)
            const completion = Math.round((teamStickers.length / teamPlayers.length) * 100) || 0

            return (
              <Card 
                key={team.id} 
                className="cursor-pointer hover:border-brand-red/50 transition-colors bg-card hover:shadow-md"
                onClick={() => setSelectedTeam(team.code)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <span className="text-4xl">{team.flag_emoji}</span>
                  <span className="font-bold text-sm leading-tight line-clamp-1">{team.name}</span>
                  <div className="w-full">
                    <div className="text-[10px] text-muted-foreground flex justify-between mb-1">
                      <span>{teamStickers.length}/{teamPlayers.length}</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-red"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pack Opening Overlay */}
      <AnimatePresence>
        {openingPack && newStickers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            <h2 className="text-3xl font-black text-amber-400 mb-8 tracking-wider">¡NUEVAS FIGURITAS!</h2>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-5xl">
              {newStickers.map((sticker, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, y: 100, rotation: 10 }}
                  animate={{ scale: 1, y: 0, rotation: 0 }}
                  transition={{ type: 'spring', delay: idx * 0.2 }}
                  className="w-32 h-44 sm:w-40 sm:h-56 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-xl p-3 flex flex-col items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.3)] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="w-full flex justify-between items-center text-amber-500 text-xs font-bold">
                    <span>{sticker.team_code}</span>
                    <span>{sticker.shirt_number}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-4xl">
                      {TEAMS.find(t => t.code === sticker.team_code)?.flag_emoji}
                    </span>
                  </div>
                  
                  <div className="w-full text-center bg-black/50 p-1.5 rounded-md border border-slate-700/50">
                    <p className="text-white text-xs sm:text-sm font-bold truncate">{sticker.name}</p>
                    <p className="text-amber-500/70 text-[10px] font-semibold">{sticker.position}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 1.5 }}
              className="mt-12"
            >
              <Button onClick={closePack} size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8">
                Pegar en el Álbum
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Detail Overlay */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-background md:p-8 flex flex-col"
          >
            <div className="bg-card flex-1 md:rounded-3xl border shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-4 bg-muted/30">
                <Button variant="ghost" size="icon" onClick={() => setSelectedTeam(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{TEAMS.find(t => t.code === selectedTeam)?.flag_emoji}</span>
                  <h2 className="text-xl font-bold">{TEAMS.find(t => t.code === selectedTeam)?.name}</h2>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-900/50">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {SEED_PLAYERS.filter(p => p.team_code === selectedTeam).map(player => {
                    const ownedSticker = stickers.find(s => s.player_name === player.name && s.team_code === selectedTeam)
                    const isOwned = !!ownedSticker

                    return (
                      <div 
                        key={player.name}
                        className={`aspect-[3/4] rounded-xl border-2 p-2 flex flex-col relative ${
                          isOwned 
                            ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-amber-500/30 shadow-md' 
                            : 'bg-transparent border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        {isOwned && ownedSticker.quantity > 1 && (
                          <div className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg">
                            {ownedSticker.quantity}
                          </div>
                        )}
                        
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>{player.shirt_number}</span>
                          <span>{player.position}</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center opacity-20">
                          <span className="text-5xl grayscale">{TEAMS.find(t => t.code === selectedTeam)?.flag_emoji}</span>
                        </div>
                        
                        <div className={`text-center p-1 rounded ${isOwned ? 'bg-black/80 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <p className="text-[10px] font-bold leading-tight truncate">{player.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
