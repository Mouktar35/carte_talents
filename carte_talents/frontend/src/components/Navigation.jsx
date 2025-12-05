import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Compass, Users2, Sparkles, Home, LogIn, LogOut, Inbox, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collaborationAPI } from '../services/api';

export default function Navigation({ currentView, setView }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Charger le nombre de notifications
  useEffect(() => {
    if (isAuthenticated) {
      loadNotificationCount();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotificationCount = async () => {
    try {
      const { count } = await collaborationAPI.getCount();
      setNotificationCount(count);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'explore', label: 'Explorer', icon: Compass },
    { id: 'collaborate', label: 'Collaborer', icon: Users2 },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass px-6 py-3 flex items-center justify-between">
        <button onClick={() => setView('home')} className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-2.5 rounded-xl">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Talents<span className="text-primary-400">Map</span></span>
        </button>

        <div className="flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                currentView === item.id
                  ? 'bg-primary-600/20 text-white border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          
          {/* Inbox button avec badge */}
          {isAuthenticated && (
            <button
              onClick={() => setView('inbox')}
              className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all relative ${
                currentView === 'inbox'
                  ? 'bg-primary-600/20 text-white border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </motion.span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-dark-400 hidden md:inline">
                Bonjour, <span className="text-white">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-white/5"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('auth')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-white/5"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Connexion</span>
            </button>
          )}
          
          <motion.button
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-accent-600 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            {currentView === 'create' ? 'En cours...' : 'Rejoindre'}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
