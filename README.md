# 🎵 Spotify AI Playlist Generator

Une extension Chrome qui utilise l'IA Gemini pour générer des playlists personnalisées basées sur les genres musicaux sélectionnés.

## ✨ Fonctionnalités

- **12 familles musicales** avec 150+ sous-genres
- **Interface circulaire intuitive** pour la sélection
- **Génération IA** avec l'API Gemini
- **Sélection multiple** de genres
- **Affichage des résultats** avec détails des chansons
- **Export JSON** des playlists générées

## 🚀 Installation

### 1. Installation du serveur

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

### 2. Installation de l'extension Chrome

1. Ouvrir Chrome et aller dans `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier du projet
5. L'extension sera chargée et active sur Spotify

## 🎯 Utilisation

1. **Aller sur Spotify** (open.spotify.com)
2. **Cliquer sur "AI Playlist"** dans la bibliothèque
3. **Sélectionner une famille** musicale (Rock, Electronic, Jazz, etc.)
4. **Choisir des sous-genres** spécifiques
5. **Cliquer "Create AI Playlist"**
6. **Voir les résultats** avec les détails des chansons

## 🏗️ Architecture

```
├── server.js              # Serveur Express avec API Gemini
├── content.js             # Extension Chrome
├── manifest.json          # Configuration de l'extension
├── package.json          # Dépendances Node.js
└── README.md             # Documentation
```

## 🔧 API Endpoints

### POST /generate-playlist

Génère une playlist basée sur les genres sélectionnés.

**Request:**
```json
{
  "selectedGenres": ["Alternative Rock", "Progressive Rock"]
}
```

**Response:**
```json
{
  "playlist": {
    "name": "Playlist Alternative Rock & Progressive Rock",
    "description": "Une playlist générée pour les genres: Alternative Rock, Progressive Rock",
    "genres": ["Alternative Rock", "Progressive Rock"],
    "songs": [
      {
        "title": "Titre de la chanson",
        "artist": "Nom de l'artiste",
        "year": 2020,
        "genre": "Alternative Rock",
        "description": "Description du style"
      }
    ]
  }
}
```

## 🎨 Familles Musicales Disponibles

- **🎸 Rock** - Classic Rock, Alternative, Indie, Punk, Grunge, etc.
- **🎹 Electronic** - House, Techno, Trance, Dubstep, Drum & Bass, etc.
- **🎺 Jazz** - Bebop, Swing, Fusion, Smooth Jazz, Free Jazz, etc.
- **🎤 Hip-Hop** - Old School, Gangsta Rap, Trap, Drill, Cloud Rap, etc.
- **🎻 Classical** - Baroque, Romantic, Modern, Neoclassical, Opera, etc.
- **🎵 Pop** - Pop Rock, Synthpop, K-Pop, J-Pop, Latin Pop, etc.
- **🎷 Blues** - Delta Blues, Chicago Blues, Electric Blues, etc.
- **🪕 Country** - Honky Tonk, Bluegrass, Country Rock, Outlaw Country, etc.
- **🎼 R&B** - Soul, Motown, Funk, Neo-Soul, Contemporary R&B, etc.
- **🪗 Folk** - Traditional Folk, Folk Rock, Indie Folk, Celtic Folk, etc.
- **🥁 Reggae** - Roots Reggae, Dancehall, Dub, Ska, Rocksteady, etc.
- **⚡ Metal** - Heavy Metal, Thrash, Death Metal, Black Metal, etc.

## 🔑 Configuration

L'API Gemini est configurée avec la clé fournie. Pour utiliser votre propre clé :

1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créer une nouvelle clé API
3. Remplacer la clé dans `server.js`

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifier que Node.js est installé
- Exécuter `npm install` pour installer les dépendances

### L'extension ne fonctionne pas
- Vérifier que le serveur est démarré sur le port 3000
- Vérifier la console Chrome pour les erreurs
- S'assurer que l'extension est activée

### Erreur CORS
- Le serveur est configuré avec CORS pour accepter les requêtes depuis Chrome

## 📝 Licence

MIT License - Libre d'utilisation et de modification.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ajouter de nouveaux genres musicaux
- Améliorer l'interface utilisateur
- Optimiser les prompts Gemini
- Ajouter de nouvelles fonctionnalités
