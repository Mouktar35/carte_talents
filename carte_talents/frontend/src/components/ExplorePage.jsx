import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, SlidersHorizontal, Sparkles, Download, Loader2 } from 'lucide-react';
import TalentCard from './TalentCard';

export default function ExplorePage({ 
  talents, searchQuery, setSearchQuery, filters, setFilters, allSkills, allLanguages,
  setView, setCurrentProfile, sortBy, setSortBy, sortTalents, favorites, toggleFavorite, isFavorite, exportData, loading
}) {
  const [showFilters, setShowFilters] = useState(false);

  const filteredTalents = talents.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSkills = filters.skills.length === 0 || filters.skills.some(s => t.skills?.includes(s));
    const matchLangs = filters.languages.length === 0 || filters.languages.some(l => t.languages?.includes(l));
    const matchVerified = !filters.verified || t.verified;
    const matchFavs = !filters.favorites || favorites.includes(t.id);
    return matchSearch && matchSkills && matchLangs && matchVerified && matchFavs;
  });

  const sorted = sortTalents(filteredTalents);

  return (
    <div className="min-h-screen bg-dark-950 pt-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary-500/10"><Sparkles className="w-5 h-5 text-primary-400" /></div>
            <span className="text-dark-400">Découvrez notre communauté</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Explorer les <span className="gradient-text">Talents</span></h1>
        </motion.div>

        {/* Search */}
        <div className="glass p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, compétence, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-dark-400" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium ${showFilters ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />Filtres
            </button>

            <div className="flex gap-2">
              <button onClick={() => setView('map')} className="flex items-center gap-2 px-5 py-4 rounded-xl bg-dark-800 text-dark-300">
                <MapPin className="w-5 h-5" />Carte
              </button>
              <button onClick={() => setView('cloud')} className="flex items-center gap-2 px-5 py-4 rounded-xl bg-dark-800 text-dark-300">
                <Sparkles className="w-5 h-5" />Skills
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                  <div>
                    <label className="text-sm text-dark-300 mb-2 block">Compétences</label>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.slice(0, 12).map(skill => (
                        <button
                          key={skill}
                          onClick={() => setFilters(f => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill] }))}
                          className={`px-3 py-1.5 rounded-lg text-sm ${filters.skills.includes(skill) ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300'}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFilters(f => ({ ...f, verified: !f.verified }))}
                      className={`px-4 py-2 rounded-xl ${filters.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-800 text-dark-300'}`}
                    >
                      ✓ Vérifiés
                    </button>
                    <button
                      onClick={() => setFilters(f => ({ ...f, favorites: !f.favorites }))}
                      className={`px-4 py-2 rounded-xl ${filters.favorites ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-800 text-dark-300'}`}
                    >
                      ⭐ Favoris
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-dark-400"><span className="text-white font-semibold">{sorted.length}</span> talent(s)</p>
          <div className="flex gap-2">
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 text-dark-300 text-sm">
              <Download className="w-4 h-4" />Exporter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {sorted.map((talent, i) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                index={i}
                onClick={() => { setCurrentProfile(talent); setView('profile'); }}
                isFavorite={isFavorite(talent.id)}
                onToggleFavorite={() => toggleFavorite(talent.id)}
              />
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun talent trouvé</h3>
            <button onClick={() => { setSearchQuery(''); setFilters({ skills: [], languages: [], verified: false, favorites: false }); }} className="btn-secondary mt-4">
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
