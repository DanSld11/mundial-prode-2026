'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function FloatingAlbumButton() {
  const pathname = usePathname()
  
  // Hide the button if we are already inside the album page
  if (pathname.includes('/album')) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50"
    >
      <Link href="/dashboard/album">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
          <button className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-xl transition-transform hover:scale-110">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
            
            {/* Sparkle effect */}
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </button>
        </div>
      </Link>
    </motion.div>
  )
}
