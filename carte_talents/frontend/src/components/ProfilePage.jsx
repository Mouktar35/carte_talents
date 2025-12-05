import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Award, Code, Globe, Briefcase, Mail, Linkedin, Github, ArrowLeft, Send, X, Check, Star } from 'lucide-react';

export default function ProfilePage({ profile, setView, isFavorite, toggleFavorite }) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!profile) return null;

  const handleSend = () => {
    if (message.trim()) {
      setSent(true);
      setTimeout(() => { setShowModal(false); setSent(false); setMessage(''); }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('explore')} className="flex items-center gap-2 text-dark-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />Retour
          </button>
          <button
            onClick={() => toggleFavorite(profile.id)}
            className={`p-3 rounded-xl ${isFavorite(profile.id) ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-800 text-dark-400'}`}
          >
            <Star className={`w-5 h-5 ${isFavorite(profile.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="glass overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700" />
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-dark-950">
                {profile.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">Vérifié</span>
                    </div>
                  )}
                </div>
                {profile.bio && <p className="text-lg text-dark-200 mb-4">{profile.bio}</p>}
                {profile.location && (
                  <div className="flex items-center gap-2 text-dark-400">
                    <MapPin className="w-4 h-4" />{profile.location}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {profile.skills?.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary-500/10"><Code className="w-5 h-5 text-primary-400" /></div>
                    <h2 className="text-xl font-bold text-white">Compétences ({profile.skills.length})</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
                  </div>
                </div>
              )}

              {profile.languages?.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-accent-500/10"><Globe className="w-5 h-5 text-accent-400" /></div>
                    <h2 className="text-xl font-bold text-white">Langues ({profile.languages.length})</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((l, i) => <span key={i} className="tag-accent">{l}</span>)}
                  </div>
                </div>
              )}

              {profile.projects?.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-500/10"><Briefcase className="w-5 h-5 text-emerald-400" /></div>
                    <h2 className="text-xl font-bold text-white">Projets ({profile.projects.length})</h2>
                  </div>
                  <div className="space-y-4">
                    {profile.projects.map((p, i) => (
                      <div key={i} className="bg-dark-800/50 rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-2">{p.title}</h3>
                        <p className="text-dark-300">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10"><Mail className="w-5 h-5 text-blue-400" /></div>
                  <h2 className="text-xl font-bold text-white">Contact</h2>
                </div>
                <div className="space-y-3">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 text-dark-300 hover:text-white">
                      <Mail className="w-5 h-5" />{profile.email}
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 hover:bg-blue-600/10 text-dark-300 hover:text-blue-400">
                      <Linkedin className="w-5 h-5 text-blue-500" />linkedin.com/in/{profile.linkedin}
                    </a>
                  )}
                  {profile.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700 text-dark-300 hover:text-white">
                      <Github className="w-5 h-5" />github.com/{profile.github}
                    </a>
                  )}
                </div>
              </div>

              <button onClick={() => setShowModal(true)} className="w-full btn-primary flex items-center justify-center gap-3">
                <Send className="w-5 h-5" />Proposer une collaboration
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm" onClick={() => !sent && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              {!sent ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Proposer une collaboration</h2>
                    <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-dark-400"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-dark-400 mb-4">Envoyez un message à <span className="text-white">{profile.name}</span></p>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Bonjour, je serais intéressé par..." className="input-field h-40 resize-none mb-6" />
                  <div className="flex gap-4">
                    <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                    <button onClick={handleSend} disabled={!message.trim()} className={`flex-1 ${message.trim() ? 'btn-primary' : 'bg-dark-700 text-dark-500 rounded-xl py-4 cursor-not-allowed'}`}>
                      <Send className="w-5 h-5 inline mr-2" />Envoyer
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message envoyé !</h3>
                  <p className="text-dark-400">Votre demande a été envoyée.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
