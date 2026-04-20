import React from 'react';
import { motion } from 'motion/react';

interface LoginBannerProps {
  onLogin: () => void;
}

export const LoginBanner = ({ onLogin }: LoginBannerProps) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-28 left-6 right-6 bg-white/95 backdrop-blur-xl border border-neutral-100 p-6 rounded-[32px] shadow-2xl text-center z-[55]"
    >
      <h3 className="text-sm font-black text-neutral-900 mb-1">Quer participar da festa?</h3>
      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-6">Entre para postar e interagir</p>
      <button
        onClick={onLogin}
        className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-lg"
      >
        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
        Entrar com Google
      </button>
      <p className="text-[9px] text-neutral-300 mt-4 font-bold uppercase tracking-tighter">Identificação automática Koala's Memories</p>
    </motion.div>
  );
};
