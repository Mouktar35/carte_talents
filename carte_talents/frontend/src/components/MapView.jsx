import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Users } from 'lucide-react';

export default function MapView({ talents, setView, setCurrentProfile }) {
  const byCity = talents.reduce((acc, t) => {
    const city = t.location || 'Non spécifié';
    if (!acc[city]) acc[city] = [];
    acc[city].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary-600/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <button onClick={() => setView('explore')} className="flex items-center gap-2 text-dark-400 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" />Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary-500/10"><MapPin className="w-8 h-8 text-primary-400" /></div>
            <div>
              <h1 className="text-4xl font-bold text-white">Carte des Talents</h1>
              <p className="text-dark-400">Par localisation</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(byCity).map(([city, list]) => (
            <motion.div key={city} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden hover:-translate-y-2 transition-transform">
              <div className="h-32 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 p-6 relative">
                <div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-white/80" /><h2 className="text-2xl font-bold text-white">{city}</h2></div>
                <div className="flex items-center gap-2 text-white/70"><Users className="w-4 h-4" /><span className="text-sm">{list.length} talent(s)</span></div>
              </div>
              <div className="p-4 space-y-2">
                {list.map(t => (
                  <button key={t.id} onClick={() => { setCurrentProfile(t); setView('profile'); }} className="w-full text-left p-3 rounded-xl hover:bg-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{t.name}</p>
                      <p className="text-xs text-dark-500 truncate">{(t.skills || []).slice(0, 2).join(', ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 glass p-6 flex justify-center gap-8">
          <div className="text-center"><div className="text-3xl font-bold gradient-text">{Object.keys(byCity).length}</div><div className="text-dark-400 text-sm">Villes</div></div>
          <div className="text-center"><div className="text-3xl font-bold gradient-text">{talents.length}</div><div className="text-dark-400 text-sm">Talents</div></div>
        </div>
      </div>
    </div>
  );
}
