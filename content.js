console.log("Spotify AI Generator Playlist Extender");

// Wait for the page to load
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Create and inject the AI Playlist button
async function addAIPlaylistButton() {
  try {
    // Wait for the "Créer" button to be available
    const createButton = await waitForElement('button[aria-label="Créer"]');
    
    // Find the parent container that holds the buttons
    const buttonContainer = createButton.parentElement;
    
    // Create the AI Playlist button
    const aiPlaylistButton = document.createElement('button');
    aiPlaylistButton.type = 'button';
    aiPlaylistButton.className = 'UCyimCp8rEfL5nB8paBu LLlfyKiKbOd8gfCmHcZX HgSl1rNhQllYYZneaYji LNzflW6HN3b7upl8Pt7w G_xEAccmp3ulqXjuviWK Lau6kc9Au_87a19N7MRq v7brahHJw__K_QX72Un8';
    aiPlaylistButton.setAttribute('aria-label', 'AI Playlist');
    aiPlaylistButton.style.marginLeft = '8px';
    
    // Add the plus icon (same as Créer button)
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('data-encore-id', 'icon');
    iconSvg.setAttribute('role', 'img');
    iconSvg.setAttribute('aria-hidden', 'true');
    iconSvg.setAttribute('class', 'e-91000-icon e-91000-baseline yoyv1_1LPucwCXYDe5AN');
    iconSvg.setAttribute('viewBox', '0 0 16 16');
    iconSvg.style.cssText = '--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75');
    iconSvg.appendChild(path);
    
    // Add the text span
    const textSpan = document.createElement('span');
    textSpan.className = 'e-91000-text encore-text-body-small-bold encore-internal-color-text-base';
    textSpan.setAttribute('data-encore-id', 'tet');
    textSpan.textContent = 'AI Playlist';
    
    // Add click handler
    aiPlaylistButton.addEventListener('click', () => {
      console.log('AI Playlist button clicked!');
      showMusicGenreModal();
    });
    
    // Assemble the button
    aiPlaylistButton.appendChild(iconSvg);
    aiPlaylistButton.appendChild(textSpan);
    
    // Insert the button after the Créer button
    buttonContainer.insertBefore(aiPlaylistButton, createButton.nextSibling);
    
    console.log('AI Playlist button added successfully!');
  } catch (error) {
    console.error('Failed to add AI Playlist button:', error);
  }
}

// Music families and their subgenres
const musicFamilies = {
  'Rock': {
    icon: '🎸',
    color: '#ff6b6b',
    subgenres: [
      'Classic Rock', 'Alternative Rock', 'Indie Rock', 'Punk Rock', 
      'Grunge', 'Progressive Rock', 'Psychedelic Rock', 'Hard Rock',
      'Soft Rock', 'Folk Rock', 'Blues Rock', 'Glam Rock'
    ]
  },
  'Electronic': {
    icon: '🎹',
    color: '#45b7d1',
    subgenres: [
      'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
      'Ambient', 'IDM', 'Synthwave', 'Future Bass', 'Breakbeat',
      'Electro', 'Minimal', 'Progressive House', 'Deep House'
    ]
  },
  'Jazz': {
    icon: '🎺',
    color: '#96ceb4',
    subgenres: [
      'Bebop', 'Swing', 'Fusion', 'Smooth Jazz', 'Free Jazz',
      'Hard Bop', 'Cool Jazz', 'Latin Jazz', 'Acid Jazz', 'Jazz Funk',
      'Modal Jazz', 'Post-Bop', 'Avant-Garde Jazz', 'Jazz Rock'
    ]
  },
  'Hip-Hop': {
    icon: '🎤',
    color: '#feca57',
    subgenres: [
      'Old School', 'Gangsta Rap', 'Conscious Rap', 'Trap',
      'Drill', 'Cloud Rap', 'Alternative Hip-Hop', 'Jazz Rap',
      'Boom Bap', 'Mumble Rap', 'East Coast', 'West Coast',
      'Southern Hip-Hop', 'UK Drill'
    ]
  },
  'Classical': {
    icon: '🎻',
    color: '#4ecdc4',
    subgenres: [
      'Baroque', 'Romantic', 'Modern Classical', 'Neoclassical',
      'Chamber Music', 'Symphony', 'Opera', 'Choral',
      'Minimalist', 'Contemporary Classical', 'Avant-Garde',
      'Impressionist', 'Expressionist', 'Serialism'
    ]
  },
  'Pop': {
    icon: '🎵',
    color: '#ff9ff3',
    subgenres: [
      'Pop Rock', 'Synthpop', 'Indie Pop', 'Electropop',
      'K-Pop', 'J-Pop', 'Latin Pop', 'Bubblegum Pop',
      'Teen Pop', 'Power Pop', 'Art Pop', 'Dream Pop',
      'Chamber Pop', 'Baroque Pop'
    ]
  },
  'Blues': {
    icon: '🎷',
    color: '#8e44ad',
    subgenres: [
      'Delta Blues', 'Chicago Blues', 'Electric Blues', 'Acoustic Blues',
      'Blues Rock', 'Rhythm & Blues', 'Soul Blues', 'Country Blues',
      'Piedmont Blues', 'Texas Blues', 'Memphis Blues', 'West Coast Blues',
      'British Blues', 'Blues Revival'
    ]
  },
  'Country': {
    icon: '🪕',
    color: '#27ae60',
    subgenres: [
      'Honky Tonk', 'Bluegrass', 'Country Rock', 'Outlaw Country',
      'Nashville Sound', 'Bakersfield Sound', 'Country Pop', 'Alt-Country',
      'Progressive Country', 'Country Folk', 'Western', 'Red Dirt',
      'Country Rap', 'Bro-Country'
    ]
  },
  'R&B': {
    icon: '🎼',
    color: '#e74c3c',
    subgenres: [
      'Soul', 'Motown', 'Funk', 'Neo-Soul', 'Contemporary R&B',
      'Quiet Storm', 'New Jack Swing', 'Hip-Hop Soul', 'Alternative R&B',
      'PBR&B', 'Trap Soul', 'Gospel', 'Urban Contemporary'
    ]
  },
  'Folk': {
    icon: '🪗',
    color: '#e67e22',
    subgenres: [
      'Traditional Folk', 'Folk Rock', 'Indie Folk', 'Celtic Folk',
      'American Folk', 'British Folk', 'Protest Folk', 'Folk Punk',
      'Neo-Folk', 'Freak Folk', 'Anti-Folk', 'Psychedelic Folk',
      'World Folk', 'Folk Metal'
    ]
  },
  'Reggae': {
    icon: '🥁',
    color: '#f39c12',
    subgenres: [
      'Roots Reggae', 'Dancehall', 'Dub', 'Ska', 'Rocksteady',
      'Ragga', 'Lovers Rock', 'Digital Reggae', 'Reggaeton',
      'Dubstep Reggae', 'Reggae Fusion', 'One Drop', 'Steppers'
    ]
  },
  'Metal': {
    icon: '⚡',
    color: '#34495e',
    subgenres: [
      'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal',
      'Power Metal', 'Progressive Metal', 'Doom Metal', 'Speed Metal',
      'Glam Metal', 'Nu Metal', 'Metalcore', 'Deathcore',
      'Folk Metal', 'Symphonic Metal'
    ]
  }
};

// Music genre modal
function showMusicGenreModal() {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'ai-playlist-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: #1a1a1a;
    border-radius: 20px;
    padding: 40px;
    max-width: 800px;
    width: 95%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
  `;

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Choose Your Music Family';
  title.style.cssText = `
    color: #fff;
    font-size: 28px;
    margin-bottom: 30px;
    font-weight: bold;
  `;

  // Navigation breadcrumb
  const breadcrumb = document.createElement('div');
  breadcrumb.id = 'breadcrumb';
  breadcrumb.style.cssText = `
    color: #999;
    margin-bottom: 20px;
    font-size: 14px;
  `;
  breadcrumb.textContent = 'Main Categories';

  // Container for current view
  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-container';
  viewContainer.style.cssText = `
    position: relative;
    width: 600px;
    height: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Track selected genres and current view
  let selectedGenres = [];
  let currentFamily = null;

  // Function to create family buttons
  function createFamilyButtons() {
    viewContainer.innerHTML = '';
    const families = Object.keys(musicFamilies);
    const angleStep = 360 / families.length;
    
    families.forEach((familyName, index) => {
      const family = musicFamilies[familyName];
      const button = document.createElement('button');
      button.className = 'family-button';
      button.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">${family.icon}</div>
        <div style="font-size: 16px; font-weight: bold;">${familyName}</div>
      `;
      
      const angle = index * angleStep;
      const radius = 200;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      
      button.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid ${family.color};
        background: linear-gradient(135deg, ${family.color}20, ${family.color}40);
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
        transform: translate(${x}px, ${y}px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
        button.style.boxShadow = `0 8px 25px ${family.color}50`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
      });

      button.addEventListener('click', () => {
        showSubgenres(familyName);
      });

      viewContainer.appendChild(button);
    });

    // Center AI icon
    const centerCircle = document.createElement('div');
    centerCircle.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 10;
    `;
    centerCircle.innerHTML = '🤖';
    viewContainer.appendChild(centerCircle);
  }

  // Function to show subgenres
  function showSubgenres(familyName) {
    currentFamily = familyName;
    const family = musicFamilies[familyName];
    viewContainer.innerHTML = '';
    
    // Update breadcrumb
    breadcrumb.innerHTML = `Main Categories > <span style="color: ${family.color}">${familyName}</span>`;
    
    // Back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '← Back';
    backButton.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: #333;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      z-index: 20;
    `;
    backButton.addEventListener('click', () => {
      currentFamily = null;
      breadcrumb.textContent = 'Main Categories';
      createFamilyButtons();
    });
    viewContainer.appendChild(backButton);

    // Create subgenre buttons
    const subgenres = family.subgenres;
    const angleStep = 360 / subgenres.length;
    
    subgenres.forEach((subgenre, index) => {
      const button = document.createElement('button');
      button.className = 'subgenre-button';
      button.innerHTML = `
        <div style="font-size: 14px; font-weight: bold;">${subgenre}</div>
      `;
      
      const angle = index * angleStep;
      const radius = 180;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      
      button.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 2px solid ${family.color};
        background: linear-gradient(135deg, ${family.color}20, ${family.color}40);
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
        transform: translate(${x}px, ${y}px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        font-size: 12px;
        text-align: center;
        padding: 5px;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
        button.style.boxShadow = `0 8px 25px ${family.color}50`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
      });

      button.addEventListener('click', () => {
        // Toggle selection
        const isSelected = selectedGenres.includes(subgenre);
        
        if (isSelected) {
          // Remove from selection
          selectedGenres = selectedGenres.filter(g => g !== subgenre);
          button.style.background = `linear-gradient(135deg, ${family.color}20, ${family.color}40)`;
          button.style.border = `2px solid ${family.color}`;
          button.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        } else {
          // Add to selection
          selectedGenres.push(subgenre);
          button.style.background = `linear-gradient(135deg, ${family.color}, ${family.color}cc)`;
          button.style.border = `2px solid #fff`;
          button.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        }
        
        console.log(`Selected genres: ${selectedGenres.join(', ')}`);
        updateSelectedDisplay();
      });

      viewContainer.appendChild(button);
    });

    // Center family icon
    const centerCircle = document.createElement('div');
    centerCircle.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${family.color}, ${family.color}cc);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 10;
    `;
    centerCircle.innerHTML = family.icon;
    viewContainer.appendChild(centerCircle);
  }

  // Initialize with family buttons
  createFamilyButtons();

  // Selected genres display
  const selectedDisplay = document.createElement('div');
  selectedDisplay.id = 'selected-genres-display';
  selectedDisplay.style.cssText = `
    margin-top: 30px;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 15px;
    border: 1px solid #444;
    min-height: 60px;
  `;

  // Create button
  const createButton = document.createElement('button');
  createButton.textContent = 'Create AI Playlist';
  createButton.style.cssText = `
    background: linear-gradient(135deg, #1db954, #1ed760);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.3s ease;
    opacity: 0.5;
    pointer-events: none;
  `;

  createButton.addEventListener('mouseenter', () => {
    if (selectedGenres.length > 0) {
      createButton.style.transform = 'scale(1.05)';
      createButton.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.4)';
    }
  });

  createButton.addEventListener('mouseleave', () => {
    createButton.style.transform = 'scale(1)';
    createButton.style.boxShadow = 'none';
  });

  createButton.addEventListener('click', async () => {
    if (selectedGenres.length > 0) {
      console.log(`Creating playlist with genres: ${selectedGenres.join(', ')}`);
      
      // Afficher un loader
      createButton.textContent = 'Génération en cours...';
      createButton.disabled = true;
      createButton.style.opacity = '0.7';
      
      try {
        // Appel au serveur AI
        const response = await fetch('http://localhost:3000/generate-playlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedGenres: selectedGenres
          })
        });

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const playlistData = await response.json();
        console.log('Playlist générée:', playlistData);
        
        // Afficher les résultats
        showPlaylistResults(playlistData);
        
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        alert(`Erreur lors de la génération de la playlist: ${error.message}`);
      } finally {
        // Restaurer le bouton
        createButton.textContent = 'Create AI Playlist';
        createButton.disabled = false;
        createButton.style.opacity = '1';
      }
    }
  });

  // Function to update selected display
  function updateSelectedDisplay() {
    if (selectedGenres.length === 0) {
      selectedDisplay.innerHTML = `
        <div style="color: #999; text-align: center; font-style: italic;">
          Select one or more music styles to create your AI playlist
        </div>
      `;
      createButton.style.opacity = '0.5';
      createButton.style.pointerEvents = 'none';
    } else {
      const genreElements = selectedGenres.map(genre => {
        // Find which family this genre belongs to
        let familyData = null;
        let familyName = '';
        
        for (const [family, data] of Object.entries(musicFamilies)) {
          if (data.subgenres.includes(genre)) {
            familyData = data;
            familyName = family;
            break;
          }
        }
        
        if (familyData) {
          return `
            <div style="
              display: inline-block;
              background: ${familyData.color}20;
              color: ${familyData.color};
              padding: 8px 15px;
              margin: 5px;
              border-radius: 20px;
              border: 1px solid ${familyData.color};
              font-size: 14px;
              font-weight: bold;
            ">
              ${familyData.icon} ${genre}
            </div>
          `;
        } else {
          // Fallback for unknown genres
          return `
            <div style="
              display: inline-block;
              background: #66620;
              color: #666;
              padding: 8px 15px;
              margin: 5px;
              border-radius: 20px;
              border: 1px solid #666;
              font-size: 14px;
              font-weight: bold;
            ">
              🎵 ${genre}
            </div>
          `;
        }
      }).join('');
      
      selectedDisplay.innerHTML = `
        <div style="color: #fff; margin-bottom: 10px; font-weight: bold;">
          Selected Styles (${selectedGenres.length}):
        </div>
        <div>${genreElements}</div>
      `;
      
      createButton.style.opacity = '1';
      createButton.style.pointerEvents = 'auto';
    }
  }

  // Function to show playlist results
  function showPlaylistResults(playlistData) {
    // Fermer toutes les modals existantes
    const existingModal = document.getElementById('ai-playlist-modal');
    const existingResultsModal = document.getElementById('playlist-results-modal');
    
    if (existingModal) {
      existingModal.remove();
    }
    if (existingResultsModal) {
      existingResultsModal.remove();
    }
    
    // Créer une nouvelle modal pour les résultats
    const resultsModal = document.createElement('div');
    resultsModal.id = 'playlist-results-modal';
    resultsModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      backdrop-filter: blur(5px);
    `;

    const resultsContent = document.createElement('div');
    resultsContent.style.cssText = `
      background: #1a1a1a;
      border-radius: 20px;
      padding: 40px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      border: 1px solid #333;
    `;

    // Titre de la playlist
    const playlistTitle = document.createElement('h2');
    playlistTitle.textContent = playlistData.playlist.name;
    playlistTitle.style.cssText = `
      color: #1db954;
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: bold;
    `;

    // Description
    const playlistDesc = document.createElement('p');
    playlistDesc.textContent = playlistData.playlist.description;
    playlistDesc.style.cssText = `
      color: #fff;
      font-size: 16px;
      margin-bottom: 30px;
      opacity: 0.8;
    `;

    // Liste des chansons
    const songsList = document.createElement('div');
    songsList.style.cssText = `
      text-align: left;
      margin-bottom: 30px;
    `;

    playlistData.playlist.songs.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.style.cssText = `
        background: #2a2a2a;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        border-left: 4px solid #1db954;
        transition: all 0.3s ease;
      `;

      songItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 5px;">
              ${song.title}
            </div>
            <div style="color: #1db954; font-size: 16px; margin-bottom: 5px;">
              ${song.artist} (${song.year})
            </div>
            <div style="color: #999; font-size: 14px;">
              ${song.genre} • ${song.description}
            </div>
          </div>
          <div style="color: #666; font-size: 14px;">
            #${index + 1}
          </div>
        </div>
      `;

      songItem.addEventListener('mouseenter', () => {
        songItem.style.background = '#333';
        songItem.style.transform = 'translateX(5px)';
      });

      songItem.addEventListener('mouseleave', () => {
        songItem.style.background = '#2a2a2a';
        songItem.style.transform = 'translateX(0)';
      });

      songsList.appendChild(songItem);
    });

    // Boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.style.cssText = `
      background: #666;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copier JSON';
    copyButton.style.cssText = `
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    closeButton.addEventListener('click', () => {
      const modal = document.getElementById('playlist-results-modal');
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(playlistData, null, 2))
        .then(() => {
          copyButton.textContent = 'Copié!';
          setTimeout(() => {
            copyButton.textContent = 'Copier JSON';
          }, 2000);
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err);
          alert('Erreur lors de la copie');
        });
    });

    // Assemble results modal
    resultsContent.appendChild(playlistTitle);
    resultsContent.appendChild(playlistDesc);
    resultsContent.appendChild(songsList);
    actionButtons.appendChild(closeButton);
    actionButtons.appendChild(copyButton);
    resultsContent.appendChild(actionButtons);
    resultsModal.appendChild(resultsContent);
    document.body.appendChild(resultsModal);
  }

  // Initialize display
  updateSelectedDisplay();

  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = '#333';
    closeButton.style.color = '#fff';
  });

  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'none';
    closeButton.style.color = '#999';
  });

  closeButton.addEventListener('click', closeModal);

  // Close modal function
  function closeModal() {
    const modal = document.getElementById('ai-playlist-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Escape key to close
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(breadcrumb);
  modalContent.appendChild(viewContainer);
  modalContent.appendChild(selectedDisplay);
  modalContent.appendChild(createButton);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

// Start the injection when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addAIPlaylistButton);
} else {
  addAIPlaylistButton();
}