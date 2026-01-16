'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

// ==================== CSS Animated Hero ====================

function AnimatedHero() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 animate-gradient" />
      
      {/* Floating cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Central lock icon */}
        <motion.div 
          className="relative z-10"
          animate={{ 
            y: [0, -10, 0],
            rotateY: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl shadow-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-16 h-16 md:w-20 md:h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </motion.div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-xl -z-10 animate-pulse" />
        </motion.div>

        {/* Floating content cards */}
        {[
          { x: -180, y: -80, delay: 0, size: 'w-24 h-16 md:w-32 md:h-20' },
          { x: 160, y: -60, delay: 0.5, size: 'w-28 h-18 md:w-36 md:h-22' },
          { x: -150, y: 100, delay: 1, size: 'w-20 h-14 md:w-28 md:h-18' },
          { x: 140, y: 90, delay: 1.5, size: 'w-26 h-16 md:w-32 md:h-20' },
          { x: 0, y: -140, delay: 2, size: 'w-22 h-14 md:w-28 md:h-18' },
        ].map((card, i) => (
          <motion.div
            key={i}
            className={`absolute ${card.size} rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/50`}
            style={{ left: `calc(50% + ${card.x}px)`, top: `calc(50% + ${card.y}px)` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -8, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              delay: card.delay,
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-2 md:p-3 space-y-1.5">
              <div className="h-2 bg-gray-200 rounded w-3/4" />
              <div className="h-1.5 bg-gray-100 rounded w-full" />
              <div className="h-1.5 bg-gray-100 rounded w-2/3" />
            </div>
          </motion.div>
        ))}

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-blue-400/20"
            style={{
              width: `${200 + ring * 100}px`,
              height: `${200 + ring * 100}px`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              delay: ring * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== UI Components ====================

function FadeInSection({ children, className = '', delay = 0 }: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SlideInCard({ children, className = '', direction = 'left', delay = 0 }: { 
  children: ReactNode; 
  className?: string;
  direction?: 'left' | 'right';
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: direction === 'left' ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: direction === 'left' ? -60 : 60 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ==================== Icons ====================

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  );
}

// ==================== Main Landing Page ====================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Custom styles for gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.9"/>
                <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.8579 8 8.42516 11.0773 8.03516 15.0875H17.5V16.9125H8.03516C8.42516 20.9227 11.8579 24 16 24Z" fill="#3B82F6"/>
              </svg>
            </div>
            <span className="text-xl font-bold">BasePaywall</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">Cara Kerja</a>
            <a href="#for-creators" className="text-white/70 hover:text-white transition-colors">Untuk Kreator</a>
            <a href="#for-readers" className="text-white/70 hover:text-white transition-colors">Untuk Pembaca</a>
          </nav>
          <Link href="/">
            <motion.button
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Masuk App
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <AnimatedHero />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Sekali Bayar.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Konten Terbuka.
              </span>
              <br />Selesai.
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Karyamu punya nilai.<br />
            Buat orang membayarnya dengan cara yang sederhana dan nyaman.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/">
              <motion.button
                className="px-8 py-4 rounded-xl font-semibold text-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ y: 0, scale: 0.98 }}
              >
                Mulai sebagai Kreator
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button
                className="px-8 py-4 rounded-xl font-semibold text-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                whileHover={{ y: -4 }}
                whileTap={{ y: 0, scale: 0.98 }}
              >
                Lihat Cara Kerja
              </motion.button>
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Konten Bagus Tidak Harus Ribet Dijual
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Banyak kreator punya tulisan, materi, dan karya digital yang bernilai.
                Sayangnya, menjualnya sering kali terasa rumit dan melelahkan.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-8 md:p-12 hover:border-white/20 transition-colors">
              <p className="text-xl md:text-2xl text-white/80 text-center leading-relaxed">
                BasePaywall hadir untuk membuat proses itu jauh lebih sederhana.<br />
                <span className="text-white font-medium">
                  Tanpa langganan. Tanpa akun panjang. Tanpa sistem yang membingungkan.
                </span>
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cara Kerjanya Sesederhana Ini
              </h2>
              <p className="text-lg text-white/60">
                Tiga langkah sederhana untuk mulai menjual kontenmu
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { step: '1', title: 'Buat Konten', desc: 'Tulis atau upload konten premium yang ingin kamu jual', icon: <PenIcon /> },
              { step: '2', title: 'Tentukan Harga', desc: 'Atur harga yang sesuai dengan nilai kontenmu', icon: <WalletIcon /> },
              { step: '3', title: 'Konten Terbuka', desc: 'Pembaca bayar sekali, konten langsung bisa diakses', icon: <ZapIcon /> },
            ].map((item, i) => (
              <SlideInCard key={item.step} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.1}>
                <motion.div 
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 text-white">
                    {item.icon}
                  </div>
                  <div className="text-sm text-blue-400 font-medium mb-2">Langkah {item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </motion.div>
              </SlideInCard>
            ))}
          </div>

          <FadeInSection delay={0.3}>
            <div className="text-center">
              <p className="text-lg text-white/70 mb-2">
                Pembaca cukup membayar satu kali.
              </p>
              <p className="text-xl text-white font-medium">
                Setelah itu, konten langsung bisa diakses kapan saja.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* For Creators */}
      <section id="for-creators" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cocok untuk Berbagai Jenis Kreator
              </h2>
              <p className="text-lg text-white/60">
                Jika kamu membuat konten bernilai, BasePaywall membantumu menjualnya
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              { title: 'Penulis', desc: 'Artikel dan catatan premium yang layak dibayar', icon: <BookIcon /> },
              { title: 'Pengajar', desc: 'Materi belajar dan tutorial eksklusif', icon: <UsersIcon /> },
              { title: 'Kreator Digital', desc: 'Konten digital eksklusif untuk audiensmu', icon: <GlobeIcon /> },
              { title: 'Komunitas', desc: 'Berbagi konten terbatas dengan anggota', icon: <ShieldIcon /> },
            ].map((item, i) => (
              <SlideInCard key={item.title} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.1}>
                <motion.div 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-5 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-white/60">{item.desc}</p>
                  </div>
                </motion.div>
              </SlideInCard>
            ))}
          </div>

          {/* Creator Benefits */}
          <FadeInSection delay={0.2}>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 md:p-10 hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-6 text-center">Kendali Tetap di Tangan Kreator</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  'Tentukan harga sendiri',
                  'Pantau hasil penjualan dengan jelas',
                  'Karyamu tetap sepenuhnya milikmu',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-white/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* For Readers */}
      <section id="for-readers" className="py-24 px-6 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nyaman untuk Pembaca
              </h2>
              <p className="text-lg text-white/60">
                Pengalaman yang simpel membuat pembaca tidak ragu untuk membayar
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Tanpa Akun', desc: 'Tidak perlu membuat akun atau registrasi panjang' },
              { title: 'Tanpa Langganan', desc: 'Tidak ada biaya bulanan yang mengikat' },
              { title: 'Bayar Sekali', desc: 'Satu kali bayar, akses selamanya' },
              { title: 'Multi Perangkat', desc: 'Bisa dibuka dari perangkat apa pun' },
            ].map((item, i) => (
              <SlideInCard key={item.title} direction={i < 2 ? 'left' : 'right'} delay={i * 0.1}>
                <motion.div 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full text-center hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                    <CheckIcon />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </motion.div>
              </SlideInCard>
            ))}
          </div>
        </div>
      </section>

      {/* Design Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-8 md:p-12 text-center hover:border-white/20 transition-colors">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Tampilan Modern yang Meyakinkan
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                BasePaywall dirancang dengan tampilan bersih dan profesional.<br />
                Animasi halus dan transisi lembut<br />
                membuat halaman terasa hidup tanpa berlebihan.
              </p>
              <p className="text-xl text-white font-medium">
                Semua dibuat agar kontenmu terlihat layak untuk dibayar.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Mulai Jual Kontenmu<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Hari Ini
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-10">
              Tidak perlu ribet. Tidak perlu sistem rumit.<br />
              Fokuslah pada karyamu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <motion.button
                  className="px-8 py-4 rounded-xl font-semibold text-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ y: 0, scale: 0.98 }}
                >
                  Mulai sebagai Kreator
                </motion.button>
              </Link>
              <Link href="/">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Pelajari Lebih Lanjut <ArrowRightIcon />
                </motion.button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.9"/>
                  <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.8579 8 8.42516 11.0773 8.03516 15.0875H17.5V16.9125H8.03516C8.42516 20.9227 11.8579 24 16 24Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="text-lg font-bold">BasePaywall</span>
            </div>
            <p className="text-white/40 text-center md:text-left italic">
              Karya punya nilai. Saatnya dihargai.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/bandungresearchai/BasePaywall" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                Base
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
