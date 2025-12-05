import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, ArrowRight, Zap, Code, MapPin, Briefcase, Award, Globe, Users2, TrendingUp } from 'lucide-react';

export default function HomePage({ setView, getSkillCounts, stats }) {
  const features = [
    { icon: Zap, title: 'Recherche Intelligente', desc: 'Trouvez des talents par compétences', color: 'bg-blue-500/10 text-blue-400' },
    { icon: Globe, title: 'Carte Interactive', desc: 'Visualisez les talents par ville', color: 'bg-purple-500/10 text-purple-400' },
    { icon: Users2, title: 'Collaboration', desc: 'Trouvez le partenaire idéal', color: 'bg-emerald-500/10 text-emerald-400' },
    { icon: Award, title: 'Profils Vérifiés', desc: 'Profils validés par CESI', color: 'bg-amber-500/10 text-amber-400' },
  ];

  const statsData = [
    { value: stats?.totalTalents || 0, label: 'Talents', icon: Users },
    { value: stats?.totalSkills || 0, label: 'Compétences', icon: Code },
    { value: stats?.cities || 0, label: 'Villes', icon: MapPin },
    { value: stats?.totalProjects || 0, label: 'Projets', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-50%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300">Plateforme CESI - Nuit de l'Info 2025</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="text-white">Carte des</span><br />
            <span className="gradient-text">Talents</span>
          </h1>

          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-12">
            Découvrez et connectez-vous avec les meilleurs talents de la communauté CESI
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button 
              onClick={() => setView('explore')} 
              className="btn-primary flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-5 h-5" />Explorer les talents<ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={() => setView('collaborate')} 
              className="btn-secondary flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <Users2 className="w-5 h-5" />Trouver un collaborateur
            </motion.button>
            <motion.button 
              onClick={() => setView('create')} 
              className="btn-secondary flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-5 h-5" />Créer mon profil
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass p-8 mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Statistiques en temps réel</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-dark-800/50 flex items-center justify-center mx-auto mb-3 text-primary-400">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-dark-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-dark-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Skills */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-10"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Compétences les plus recherchées</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {getSkillCounts().slice(0, 15).map(([skill, count]) => (
              <span key={skill} className="px-5 py-3 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 font-medium hover:bg-primary-500/20 transition-all cursor-default">
                {skill} <span className="text-dark-500">({count})</span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
