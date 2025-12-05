import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import ProfilePage from './components/ProfilePage';
import CreateProfilePage from './components/CreateProfilePage';
import MapView from './components/MapView';
import SkillsCloud from './components/SkillsCloud';
import CollaborationPage from './components/CollaborationPage';
import InboxPage from './components/InboxPage';
import AuthPage from './components/AuthPage';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { talentsAPI } from './services/api';

function AppContent() {
  const [view, setView] = useState('home');
  const [talents, setTalents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ skills: [], languages: [], verified: false, favorites: false });
  const [sortBy, setSortBy] = useState('name');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { toasts, success, info, error: showError } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Charger les talents depuis l'API
  useEffect(() => {
    loadTalents();
    loadStats();
  }, []);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const data = await talentsAPI.getAll();
      setTalents(data);
    } catch (err) {
      console.error('Erreur chargement talents:', err);
      // Fallback aux données statiques si l'API ne répond pas
      const { sampleTalents } = await import('./data/sampleData');
      setTalents(sampleTalents);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await talentsAPI.getStats();
      setStats(data);
    } catch (err) {
      // Calculer les stats depuis les talents locaux
      console.error('Erreur chargement stats:', err);
    }
  };

  const addTalent = useCallback(async (data) => {
    try {
      if (isAuthenticated) {
        const newTalent = await talentsAPI.create(data);
        setTalents(prev => [...prev, newTalent]);
      } else {
        // Mode démo sans authentification
        setTalents(prev => [...prev, { ...data, id: Date.now(), createdAt: new Date().toISOString(), verified: false }]);
      }
      success('Profil créé avec succès ! 🎉');
      setView('explore');
    } catch (err) {
      showError(err.message);
    }
  }, [isAuthenticated, success, showError]);

  const toggleFavorite = useCallback(async (id) => {
    try {
      if (favorites.includes(id)) {
        if (isAuthenticated) await talentsAPI.removeFavorite(id);
        setFavorites(prev => prev.filter(x => x !== id));
        info('Retiré des favoris');
      } else {
        if (isAuthenticated) await talentsAPI.addFavorite(id);
        setFavorites(prev => [...prev, id]);
        success('Ajouté aux favoris ⭐');
      }
    } catch (err) {
      showError(err.message);
    }
  }, [favorites, isAuthenticated, success, info, showError]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const exportData = useCallback(() => {
    const data = JSON.stringify(talents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talents-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    success('Données exportées ! 📁');
  }, [talents, success]);

  const getSkillCounts = useCallback(() => {
    const counts = {};
    talents.forEach(t => (t.skills || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [talents]);

  const getStats = useCallback(() => ({
    totalTalents: stats.totalTalents || talents.length,
    verifiedTalents: stats.verifiedTalents || talents.filter(t => t.verified).length,
    totalSkills: stats.totalSkills || [...new Set(talents.flatMap(t => t.skills || []))].length,
    totalLanguages: stats.totalLanguages || [...new Set(talents.flatMap(t => t.languages || []))].length,
    cities: stats.cities || [...new Set(talents.map(t => t.location).filter(Boolean))].length,
    totalProjects: stats.totalProjects || talents.reduce((acc, t) => acc + (t.projects?.length || 0), 0),
  }), [talents, stats]);

  const allSkills = [...new Set(talents.flatMap(t => t.skills || []))];
  const allLanguages = [...new Set(talents.flatMap(t => t.languages || []))];

  const sortTalents = useCallback((list) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'skills') return (b.skills?.length || 0) - (a.skills?.length || 0);
      return 0;
    });
  }, [sortBy]);

  // Helper pour les toasts
  const showToast = (message, type = 'info') => {
    if (type === 'success') success(message);
    else if (type === 'error') showError(message);
    else info(message);
  };

  const renderView = () => {
    if (view === 'auth') return <AuthPage setView={setView} />;
    
    switch (view) {
      case 'home': return <HomePage setView={setView} getSkillCounts={getSkillCounts} stats={getStats()} />;
      case 'explore': return <ExplorePage talents={talents} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filters={filters} setFilters={setFilters} allSkills={allSkills} allLanguages={allLanguages} setView={setView} setCurrentProfile={setCurrentProfile} sortBy={sortBy} setSortBy={setSortBy} sortTalents={sortTalents} favorites={favorites} toggleFavorite={toggleFavorite} isFavorite={isFavorite} exportData={exportData} loading={loading} />;
      case 'profile': return <ProfilePage profile={currentProfile} setView={setView} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
      case 'create': return <CreateProfilePage onAddTalent={addTalent} setView={setView} />;
      case 'map': return <MapView talents={talents} setView={setView} setCurrentProfile={setCurrentProfile} />;
      case 'cloud': return <SkillsCloud talents={talents} setView={setView} setCurrentProfile={setCurrentProfile} />;
      case 'collaborate': return <CollaborationPage talents={talents} setView={setView} setCurrentProfile={setCurrentProfile} showToast={showToast} />;
      case 'inbox': return <InboxPage showToast={showToast} setView={setView} />;
      default: return <HomePage setView={setView} getSkillCounts={getSkillCounts} stats={getStats()} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <ToastContainer toasts={toasts} />
      {view !== 'home' && view !== 'auth' && <Navigation currentView={view} setView={setView} />}
      <AnimatePresence mode="wait">
        <motion.main key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {renderView()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
