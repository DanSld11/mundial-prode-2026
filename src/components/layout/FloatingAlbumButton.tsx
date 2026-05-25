'use client'

import { BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlbum } from '../album/AlbumContext'

export function FloatingAlbumButton() {
  const { isOpen, openAlbum } = useAlbum()
  
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40"
        >
          <div className="relative group cursor-pointer" onClick={openAlbum}>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <button className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-xl transition-transform hover:scale-110">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
              
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
