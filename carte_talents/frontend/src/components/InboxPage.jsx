import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Send, Check, X, Clock, User, MapPin, 
  MessageSquare, Loader2, CheckCircle2, XCircle, Mail, ArrowRight, LogIn
} from 'lucide-react';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InboxPage({ showToast, setView }) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        collaborationAPI.getReceived(),
        collaborationAPI.getSent()
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showToast?.('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await collaborationAPI.accept(id);
      showToast?.('Demande acceptée ! Vous pouvez maintenant collaborer.', 'success');
      loadRequests();
    } catch (error) {
      showToast?.(error.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await collaborationAPI.reject(id);
      showToast?.('Demande refusée', 'info');
      loadRequests();
    } catch (error) {
      showToast?.(error.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    try {
      await collaborationAPI.delete(id);
      showToast?.('Demande annulée', 'info');
      loadRequests();
    } catch (error) {
      showToast?.(error.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" />En attente</span>;
      case 'accepted':
        return <span className="px-3 py-1.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Acceptée</span>;
      case 'rejected':
        return <span className="px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1.5 font-medium"><XCircle className="w-3.5 h-3.5" />Refusée</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const pendingCount = receivedRequests.filter(r => r.status === 'pending').length;
  const acceptedCount = sentRequests.filter(r => r.status === 'accepted').length;

  // Si non connecté, afficher page de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-12 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
          <p className="text-dark-400 mb-6">Connectez-vous pour voir vos demandes de collaboration.</p>
          <button
            onClick={() => setView?.('auth')}
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass mb-6">
            <MessageSquare className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300">Centre de messages</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Mes <span className="gradient-text">Collaborations</span>
          </h1>
          <p className="text-dark-400">Gérez vos demandes de collaboration reçues et envoyées</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-dark-400 text-sm">Demandes en attente</p>
          </div>
          <div className="glass p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{acceptedCount}</p>
            <p className="text-dark-400 text-sm">Collaborations acceptées</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 glass p-2 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Reçues
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            Envoyées
            {acceptedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500 text-white">{acceptedCount}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'received' ? (
              <motion.div
                key="received"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {receivedRequests.length === 0 ? (
                  <div className="glass p-12 text-center">
                    <Inbox className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucune demande reçue</h3>
                    <p className="text-dark-400">Les demandes de collaboration que vous recevez apparaîtront ici.</p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass p-6 ${request.status === 'pending' ? 'border-l-4 border-yellow-500' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {request.sender_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">{request.sender_name}</h3>
                            {getStatusBadge(request.status)}
                            <span className="text-dark-600 text-sm">{formatDate(request.created_at)}</span>
                          </div>
                          
                          {/* Afficher l'email si la demande est acceptée */}
                          {request.status === 'accepted' && (
                            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-emerald-400 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact: <a href={`mailto:${request.sender_email}`} className="underline hover:text-emerald-300">{request.sender_email}</a>
                              </p>
                            </div>
                          )}
                          
                          {request.sender_location && (
                            <p className="text-dark-500 text-sm flex items-center gap-1 mb-3">
                              <MapPin className="w-3.5 h-3.5" />{request.sender_location}
                            </p>
                          )}
                          {request.sender_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {request.sender_skills.slice(0, 5).map((skill, i) => (
                                <span key={i} className="tag text-xs">{skill}</span>
                              ))}
                            </div>
                          )}
                          <div className="bg-dark-800/50 rounded-xl p-4">
                            <p className="text-dark-300 text-sm">"{request.message}"</p>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleAccept(request.id)}
                              disabled={processingId === request.id}
                              className="px-4 py-2.5 rounded-xl text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                            >
                              {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Accepter
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={processingId === request.id}
                              className="px-4 py-2.5 rounded-xl text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                            >
                              {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {sentRequests.length === 0 ? (
                  <div className="glass p-12 text-center">
                    <Send className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucune demande envoyée</h3>
                    <p className="text-dark-400 mb-6">Vos demandes de collaboration envoyées apparaîtront ici.</p>
                    <button
                      onClick={() => setView?.('collaborate')}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Trouver des collaborateurs
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass p-6 ${request.status === 'accepted' ? 'border-l-4 border-emerald-500' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {request.receiver_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">À: {request.receiver_name}</h3>
                            {getStatusBadge(request.status)}
                            <span className="text-dark-600 text-sm">{formatDate(request.created_at)}</span>
                          </div>
                          
                          {/* Afficher l'email si la demande est acceptée */}
                          {request.status === 'accepted' && (
                            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-emerald-400 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-medium">Demande acceptée !</span>
                              </p>
                              <p className="text-emerald-300 text-sm mt-1 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contactez: <a href={`mailto:${request.receiver_email}`} className="underline hover:text-emerald-200">{request.receiver_email}</a>
                              </p>
                            </div>
                          )}
                          
                          {request.status === 'rejected' && (
                            <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                              <p className="text-red-400 text-sm">Cette demande a été refusée par {request.receiver_name}.</p>
                            </div>
                          )}
                          
                          <div className="bg-dark-800/50 rounded-xl p-4">
                            <p className="text-dark-300 text-sm">"{request.message}"</p>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(request.id)}
                            disabled={processingId === request.id}
                            className="px-4 py-2.5 rounded-xl text-sm bg-dark-800 text-dark-400 hover:bg-dark-700 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                          >
                            {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            Annuler
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
