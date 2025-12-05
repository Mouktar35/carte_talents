import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users2, Search, MapPin, Briefcase, Send, X, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CollaborationPage({ talents, setView, setCurrentProfile, showToast }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const allSkills = [...new Set(talents.flatMap(t => t.skills || []))];

  const filtered = talents.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) || t.bio?.toLowerCase().includes(search.toLowerCase());
    const matchSkill = !skill || t.skills?.includes(skill);
    return matchSearch && matchSkill;
  });

  const contact = (t) => {
    if (!user) {
      showToast?.('Connectez-vous pour envoyer une demande', 'error');
      setView('auth');
      return;
    }
    setTarget(t);
    setShowModal(true);
    setError('');
  };

  const send = async () => {
    if (!message.trim() || !target?.user_id) return;
    
    setSending(true);
    setError('');
    
    try {
      await collaborationAPI.sendRequest(target.user_id, message);
      setSent(true);
      showToast?.('Demande envoyée avec succès !', 'success');
      setTimeout(() => {
        setShowModal(false);
        setSent(false);
        setMessage('');
        setTarget(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const ideas = [
    { title: 'Projet Web', desc: 'Application React/Node.js', skills: ['React', 'Node.js'] },
    { title: 'Data Science', desc: 'Analyse de données et ML', skills: ['Python', 'TensorFlow'] },
    { title: 'Mobile App', desc: 'Application iOS/Android', skills: ['React Native', 'Swift'] },
    { title: 'UI/UX Design', desc: 'Design d\'interface', skills: ['Figma', 'Adobe XD'] },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass mb-6">
            <Users2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-dark-300">Trouvez votre partenaire</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Trouver un <span className="gradient-text">Collaborateur</span></h1>
          {!user && (
            <p className="text-yellow-400 text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Connectez-vous pour envoyer des demandes de collaboration
            </p>
          )}
        </div>

        <div className="glass p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 w-5 h-5" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" />
            </div>
            <select value={skill} onChange={e => setSkill(e.target.value)} className="input-field min-w-[200px]">
              <option value="">Toutes compétences</option>
              {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Talents disponibles ({filtered.length})</h2>
            <div className="space-y-4">
              {filtered.slice(0, 8).map(t => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{t.name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{t.name}</h3>
                        {t.verified && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Vérifié</span>}
                      </div>
                      <p className="text-dark-400 text-sm mb-3 line-clamp-1">{t.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(t.skills || []).slice(0, 4).map((s, i) => <span key={i} className="tag text-xs">{s}</span>)}
                      </div>
                      <div className="flex items-center gap-4 text-dark-500 text-sm">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t.location || 'Non spécifié'}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{t.projects?.length || 0} projet(s)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setCurrentProfile(t); setView('profile'); }} className="px-4 py-2 rounded-xl text-sm bg-dark-800 text-dark-300 hover:bg-dark-700">Profil</button>
                      <button 
                        onClick={() => contact(t)} 
                        disabled={!t.user_id}
                        className={`px-4 py-2 rounded-xl text-sm ${
                          t.user_id 
                            ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg hover:shadow-primary-500/25' 
                            : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                        }`}
                        title={!t.user_id ? 'Ce profil n\'est pas lié à un compte' : ''}
                      >
                        Contacter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Idées de projets</h2>
            <div className="space-y-4">
              {ideas.map((idea, i) => (
                <div key={i} onClick={() => setSkill(idea.skills[0])} className="glass p-5 cursor-pointer hover:bg-white/5">
                  <h3 className="font-bold text-white mb-2">{idea.title}</h3>
                  <p className="text-dark-400 text-sm mb-3">{idea.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.skills.map((s, j) => <span key={j} className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary-500/10"><Sparkles className="w-5 h-5 text-primary-400" /></div>
                <h3 className="font-bold text-white">Astuce</h3>
              </div>
              <p className="text-dark-400 text-sm">Cliquez sur une idée pour filtrer les talents par compétence.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && target && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm" onClick={() => !sent && !sending && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              {!sent ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Contacter {target.name}</h2>
                    <button onClick={() => setShowModal(false)} disabled={sending} className="p-2 rounded-xl hover:bg-white/5 text-dark-400 disabled:opacity-50"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-dark-400 mb-4">Décrivez votre projet ou proposition de collaboration.</p>
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  <textarea 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Bonjour, je travaille sur un projet intéressant et je pense que vos compétences seraient parfaites pour..." 
                    className="input-field h-40 resize-none mb-6" 
                    disabled={sending}
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setShowModal(false)} disabled={sending} className="flex-1 btn-secondary disabled:opacity-50">Annuler</button>
                    <button 
                      onClick={send} 
                      disabled={!message.trim() || sending} 
                      className={`flex-1 flex items-center justify-center gap-2 ${message.trim() && !sending ? 'btn-primary' : 'bg-dark-700 text-dark-500 rounded-xl py-4 cursor-not-allowed'}`}
                    >
                      {sending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Envoi...</>
                      ) : (
                        <><Send className="w-5 h-5" />Envoyer</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h3>
                  <p className="text-dark-400">Votre demande a été envoyée à {target.name}.</p>
                  <p className="text-dark-500 text-sm mt-2">Vous serez notifié de sa réponse.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
