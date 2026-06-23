// AI playlist generation only (Heroku). Spotify ops are in spotifyApi.js.

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Générer une playlist avec l'IA.
// Le 3e argument accepte soit un code pays (rétro-compat), soit un objet
// d'options Radio: { countries, languages, energy, popularity, surprise, era,
// mood, duration, fusion, vibePrompt, journey, countryOrigin }.
async function generatePlaylist(selectedGenres, songCount, optionsOrCountry = null) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GENERATE_PLAYLIST}`;

  const options = (optionsOrCountry && typeof optionsOrCountry === 'object' && !Array.isArray(optionsOrCountry))
    ? optionsOrCountry
    : { countryOrigin: optionsOrCountry };

  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      selectedGenres,
      songCount,
      ...options
    }),
    mode: 'cors',
    credentials: 'omit'
  });
}

window.generatePlaylist = generatePlaylist;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePlaylist };
}
