import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-base-dark" />
      
      {/* Large Glowing Orbs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #0052FF 0%, transparent 70%)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
          x: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[150px]"
        style={{ background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #B533FF 0%, transparent 70%)' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.15, 0.05],
          x: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      
      {/* Floating Particles (CSS Animation for performance) */}
      {/* We could use canvas, but for ambient a few motion divs are fine */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, -Math.random() * 100 - 50],
            opacity: [0, Math.random() * 0.5 + 0.2, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 10,
          }}
        />
      ))}
      
      {/* Grid overlay for cyberpunk feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
