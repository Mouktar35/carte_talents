import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Award, Star, Linkedin, Github } from 'lucide-react';

export default function TalentCard({ talent, index, onClick, isFavorite, onToggleFavorite }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="glass p-6 cursor-pointer hover:-translate-y-2 transition-all duration-300 relative group"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
          isFavorite ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-800/50 text-dark-400 hover:text-amber-400'
        }`}
      >
        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-2xl font-bold">
          {talent.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white truncate">{talent.name}</h3>
            {talent.verified && (
              <div className="p-1 rounded-full bg-emerald-500/20">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-dark-400 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{talent.location || 'Non spécifié'}</span>
          </div>
        </div>
      </div>

      <p className="text-dark-300 text-sm line-clamp-2 mb-4">{talent.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(talent.skills || []).slice(0, 4).map((skill, i) => (
          <span key={i} className="tag text-xs">{skill}</span>
        ))}
        {(talent.skills?.length || 0) > 4 && (
          <span className="px-3 py-1 rounded-full text-xs bg-dark-700 text-dark-400">+{talent.skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-2">
          {talent.linkedin && <Linkedin className="w-4 h-4 text-blue-400" />}
          {talent.github && <Github className="w-4 h-4 text-dark-300" />}
        </div>
        <span className="text-xs text-dark-500">{talent.projects?.length || 0} projet(s)</span>
      </div>
    </motion.div>
  );
}
