const API_URL = 'http://localhost:5000/api';

// Helper pour les requêtes
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
};

// Talents API
export const talentsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/talents${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/talents/${id}`),
  create: (data) => request('/talents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/talents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/talents/${id}`, { method: 'DELETE' }),
  
  // Stats
  getStats: () => request('/talents/stats/overview'),
  getSkillStats: () => request('/talents/stats/skills'),
  
  // Favorites
  addFavorite: (id) => request(`/talents/${id}/favorite`, { method: 'POST' }),
  removeFavorite: (id) => request(`/talents/${id}/favorite`, { method: 'DELETE' }),
  getFavorites: () => request('/talents/user/favorites'),
};

// Collaboration API
export const collaborationAPI = {
  // Envoyer une demande de collaboration
  sendRequest: (receiverId, message) => request('/collaboration/request', {
    method: 'POST',
    body: JSON.stringify({ receiverId, message })
  }),
  
  // Obtenir les demandes reçues
  getReceived: () => request('/collaboration/received'),
  
  // Obtenir les demandes envoyées
  getSent: () => request('/collaboration/sent'),
  
  // Compter les demandes en attente
  getCount: () => request('/collaboration/count'),
  
  // Accepter une demande
  accept: (id) => request(`/collaboration/${id}/accept`, { method: 'PUT' }),
  
  // Refuser une demande
  reject: (id) => request(`/collaboration/${id}/reject`, { method: 'PUT' }),
  
  // Supprimer une demande
  delete: (id) => request(`/collaboration/${id}`, { method: 'DELETE' }),
};

export default { authAPI, talentsAPI, collaborationAPI };
