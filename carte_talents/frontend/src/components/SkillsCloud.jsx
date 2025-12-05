import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, X } from 'lucide-react';

export default function SkillsCloud({ talents, setView, setCurrentProfile }) {
  const [selected, setSelected] = useState(null);

  const counts = talents.reduce((acc, t) => {
    (t.skills || []).forEach(s => { acc[s] = (acc[s] || 0) + 1; });
    return acc;
  }, {});

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  const getSize = (count) => 0.85 + (count / max) * 0.8;
  const getTalents = (skill) => talents.filter(t => (t.skills || []).includes(skill));

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <button onClick={() => setView('explore')} className="flex items-center gap-2 text-dark-400 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" />Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-accent-500/10"><Sparkles className="w-8 h-8 text-accent-400" /></div>
            <div>
              <h1 className="text-4xl font-bold text-white">Nuage de Compétences</h1>
              <p className="text-dark-400">Cliquez pour voir les talents</p>
            </div>
          </div>
        </div>

        <div className="glass p-10 mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {sorted.map(([skill, count]) => (
              <motion.button
                key={skill}
                onClick={() => setSelected(selected === skill ? null : skill)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  selected === skill
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
                    : 'bg-primary-500/10 text-primary-300 border border-primary-500/20 hover:bg-primary-500/20'
                }`}
                style={{ fontSize: `${getSize(count)}rem` }}
                whileHover={{ scale: 1.08, y: -4 }}
              >
                {skill} <span className="text-sm opacity-70">({count})</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Talents avec "<span className="gradient-text">{selected}</span>"</h2>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-white/5 text-dark-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTalents(selected).map(t => (
                    <button key={t.id} onClick={() => { setCurrentProfile(t); setView('profile'); }} className="text-left p-5 rounded-2xl bg-dark-800/50 hover:bg-dark-800 transition-all">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-white">{t.name}</p>
                          <p className="text-sm text-dark-500">{t.location}</p>
                        </div>
                      </div>
                      <p className="text-dark-400 text-sm line-clamp-2">{t.bio}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 glass p-6 flex justify-center gap-8">
          <div className="text-center"><div className="text-3xl font-bold gradient-text">{sorted.length}</div><div className="text-dark-400 text-sm">Compétences</div></div>
          <div className="text-center"><div className="text-3xl font-bold gradient-text">{sorted[0]?.[0] || '-'}</div><div className="text-dark-400 text-sm">Plus populaire</div></div>
        </div>
      </div>
    </div>
  );
}
