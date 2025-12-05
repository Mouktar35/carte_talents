import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Code, Briefcase, Globe, Linkedin, Github, Plus, X, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function CreateProfilePage({ onAddTalent, setView }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', bio: '', email: '', location: '', skills: [], languages: [], projects: [], linkedin: '', github: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Requis';
    if (!formData.email.trim()) errs.email = 'Requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (step === 1 && !validate()) return; if (step < 4) setStep(step + 1); };
  const prev = () => { if (step > 1) setStep(step - 1); };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const addLang = () => {
    if (newLang.trim() && !formData.languages.includes(newLang.trim())) {
      setFormData({ ...formData, languages: [...formData.languages, newLang.trim()] });
      setNewLang('');
    }
  };

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setFormData({ ...formData, projects: [...formData.projects, { ...newProject }] });
      setNewProject({ title: '', description: '' });
    }
  };

  const submit = () => { onAddTalent(formData); };

  const steps = [
    { n: 1, title: 'Infos', icon: User },
    { n: 2, title: 'Skills', icon: Code },
    { n: 3, title: 'Projets', icon: Briefcase },
    { n: 4, title: 'Liens', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent-600/15 rounded-full blur-[150px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6">
        <button onClick={() => setView('explore')} className="flex items-center gap-2 text-dark-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5" />Retour
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300">Créez votre profil</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Rejoignez la <span className="gradient-text">communauté</span></h1>
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${step >= s.n ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-500'}`}>
                  {step > s.n ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs ${step >= s.n ? 'text-primary-400' : 'text-dark-500'}`}>{s.title}</span>
              </div>
              {i < 3 && <div className={`h-0.5 w-16 mx-2 ${step > s.n ? 'bg-primary-500' : 'bg-dark-700'}`} />}
            </div>
          ))}
        </div>

        <div className="glass p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Informations de base</h2>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Nom complet *</label>
                <input type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="Jean Dupont" />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Bio</label>
                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="input-field h-24 resize-none" placeholder="Décrivez-vous..." />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }} className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="jean@example.com" />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Ville</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="input-field" placeholder="Paris" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Compétences & Langues</h2>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Compétences</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input-field" placeholder="React, Python..." />
                  <button onClick={addSkill} className="px-4 rounded-xl bg-primary-600 text-white"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((s, i) => (
                    <span key={i} className="tag flex items-center gap-2">{s}<button onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button></span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Langues</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newLang} onChange={e => setNewLang(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLang())} className="input-field" placeholder="Français, Anglais..." />
                  <button onClick={addLang} className="px-4 rounded-xl bg-accent-600 text-white"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((l, i) => (
                    <span key={i} className="tag-accent flex items-center gap-2">{l}<button onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button></span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Projets</h2>
              <div className="space-y-4">
                <input type="text" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="input-field" placeholder="Titre du projet" />
                <textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="input-field h-20 resize-none" placeholder="Description..." />
                <button onClick={addProject} disabled={!newProject.title.trim() || !newProject.description.trim()} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${newProject.title.trim() && newProject.description.trim() ? 'bg-emerald-600 text-white' : 'bg-dark-700 text-dark-500 cursor-not-allowed'}`}>
                  <Plus className="w-5 h-5" />Ajouter
                </button>
              </div>
              {formData.projects.map((p, i) => (
                <div key={i} className="bg-dark-800/50 rounded-xl p-4 relative group">
                  <button onClick={() => setFormData({ ...formData, projects: formData.projects.filter((_, j) => j !== i) })} className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                  <h4 className="font-bold text-white">{p.title}</h4>
                  <p className="text-dark-400 text-sm">{p.description}</p>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Liens & réseaux</h2>
              <div>
                <label className="block text-sm text-dark-300 mb-2">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                  <input type="text" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} className="input-field pl-12" placeholder="votre-profil" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">GitHub</label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input type="text" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} className="input-field pl-12" placeholder="username" />
                </div>
              </div>
              <div className="bg-dark-800/50 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Récapitulatif</h3>
                <div className="text-sm space-y-2">
                  <p className="text-dark-400">Nom: <span className="text-white">{formData.name || '-'}</span></p>
                  <p className="text-dark-400">Email: <span className="text-white">{formData.email || '-'}</span></p>
                  <p className="text-dark-400">Compétences: <span className="text-white">{formData.skills.length}</span></p>
                  <p className="text-dark-400">Projets: <span className="text-white">{formData.projects.length}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button onClick={prev} disabled={step === 1} className={`flex items-center gap-2 px-6 py-3 rounded-xl ${step === 1 ? 'text-dark-600 cursor-not-allowed' : 'text-dark-300 hover:text-white'}`}>
            <ArrowLeft className="w-5 h-5" />Précédent
          </button>
          {step < 4 ? (
            <button onClick={next} className="btn-primary flex items-center gap-2">Suivant<ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={submit} className="btn-primary flex items-center gap-2"><Check className="w-5 h-5" />Créer mon profil</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
