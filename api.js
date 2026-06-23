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

async function generatePlaylist(selectedGenres, songCount, countryOrigin = null) {
  const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GENERATE_PLAYLIST}`;

  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      selectedGenres,
      songCount,
      countryOrigin
    }),
    mode: 'cors',
    credentials: 'omit'
  });
}

window.generatePlaylist = generatePlaylist;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePlaylist };
}
