# 🎯 Carte des Talents - CESI

Plateforme de découverte et de mise en relation des talents de la communauté CESI.

## 📁 Structure du projet

```
carte_talents/
├── frontend/          # Application React (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── context/       # Context API (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Services API
│   │   └── data/          # Données statiques (fallback)
│   └── ...
│
├── backend/           # API Node.js (Express + SQLite)
│   ├── database/      # Configuration BDD
│   ├── middleware/    # Middlewares (auth)
│   ├── routes/        # Routes API
│   ├── server.js      # Point d'entrée
│   └── seed.js        # Script de peuplement BDD
│
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run seed    # Peupler la base de données
npm run dev     # Démarrer le serveur (port 5000)
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Démarrer l'app (port 3000)
```

## 🔗 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur |

### Talents
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/talents` | Liste des talents |
| GET | `/api/talents/:id` | Détail d'un talent |
| POST | `/api/talents` | Créer un talent |
| PUT | `/api/talents/:id` | Modifier un talent |
| DELETE | `/api/talents/:id` | Supprimer un talent |
| GET | `/api/talents/stats/overview` | Statistiques |
| GET | `/api/talents/stats/skills` | Skills populaires |

### Favoris
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/talents/:id/favorite` | Ajouter aux favoris |
| DELETE | `/api/talents/:id/favorite` | Retirer des favoris |
| GET | `/api/talents/user/favorites` | Mes favoris |

## 🛠️ Technologies

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- Lucide React Icons

### Backend
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs

## 📊 Base de données

Tables SQLite :
- `users` - Utilisateurs
- `talents` - Profils talents
- `skills` - Compétences
- `languages` - Langues
- `projects` - Projets
- `favorites` - Favoris
- `messages` - Messages de collaboration

## 🎨 Fonctionnalités

- ✅ Exploration des talents
- ✅ Recherche et filtres
- ✅ Création de profil
- ✅ Système de favoris
- ✅ Authentification JWT
- ✅ Statistiques en temps réel
- ✅ Export des données
- ✅ Mode collaboration

## 👥 Équipe

Projet réalisé lors de la Nuit de l'Info 2024 - CESI

## 📄 Licence

MIT
