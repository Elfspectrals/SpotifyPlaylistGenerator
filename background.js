(function () {
  // Shared Spotify app Client ID (PKCE, no secret needed).
  // Same app for every user: no manual setup required.
  const SPOTIFY_CLIENT_ID = '88f72a9065824fdf8d3b169f7c301404';

  const STORAGE_KEYS = {
    ACCESS_TOKEN: 'byoAccessToken',
    REFRESH_TOKEN: 'byoRefreshToken',
    TOKEN_EXPIRY: 'byoTokenExpiry'
  };

  const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
  const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
  const SCOPES = 'playlist-modify-public playlist-modify-private user-read-email';

  function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, function (x) { return possible[x % possible.length]; }).join('');
  }

  function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  async function buildAuthUrl(clientId, redirectUri, codeChallenge, state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      state: state
    });
    return SPOTIFY_AUTH_URL + '?' + params.toString();
  }

  async function exchangeCodeForToken(clientId, redirectUri, code, codeVerifier) {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error('Token exchange failed: ' + response.status + ' ' + text);
    }
    return response.json();
  }

  async function refreshAccessToken(clientId, refreshToken) {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error('Token refresh failed: ' + response.status + ' ' + text);
    }
    return response.json();
  }

  function getStored() {
    return new Promise(function (resolve) {
      chrome.storage.local.get(
        [STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.TOKEN_EXPIRY],
        resolve
      );
    });
  }

  function setTokens(accessToken, refreshToken, expiresIn) {
    const expiry = Date.now() + (expiresIn * 1000) - 60000;
    return new Promise(function (resolve) {
      chrome.storage.local.set({
        [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
        [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken || null,
        [STORAGE_KEYS.TOKEN_EXPIRY]: expiry
      }, resolve);
    });
  }

  async function runOAuth(clientId, redirectUri) {
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(hashed);

    const authUrl = await buildAuthUrl(clientId, redirectUri, codeChallenge, state);
    const redirectUrl = await new Promise(function (resolve, reject) {
      chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        function (callbackUrl) {
          if (chrome.runtime.lastError) {
            const msg = chrome.runtime.lastError.message || 'Auth flow failed';
            reject(new Error(msg + '|REDIRECT_URI|' + redirectUri));
            return;
          }
          if (!callbackUrl) {
            reject(new Error('No callback URL. Did you close the login window?|REDIRECT_URI|' + redirectUri));
            return;
          }
          resolve(callbackUrl);
        }
      );
    });

    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      throw new Error(error === 'access_denied' ? 'Access denied' : error);
    }
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    const tokenData = await exchangeCodeForToken(clientId, redirectUri, code, codeVerifier);
    await setTokens(
      tokenData.access_token,
      tokenData.refresh_token || null,
      tokenData.expires_in || 3600
    );
    return { accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token || null };
  }

  async function getValidToken() {
    const stored = await getStored();
    const clientId = SPOTIFY_CLIENT_ID;

    const redirectUri = chrome.identity.getRedirectURL();
    let accessToken = stored[STORAGE_KEYS.ACCESS_TOKEN];
    let refreshToken = stored[STORAGE_KEYS.REFRESH_TOKEN];
    const expiry = stored[STORAGE_KEYS.TOKEN_EXPIRY];

    const now = Date.now();
    if (accessToken && expiry && now < expiry) {
      return { accessToken: accessToken, refreshToken: refreshToken };
    }

    if (refreshToken) {
      try {
        const tokenData = await refreshAccessToken(clientId, refreshToken);
        await setTokens(
          tokenData.access_token,
          tokenData.refresh_token || refreshToken,
          tokenData.expires_in || 3600
        );
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || refreshToken
        };
      } catch (_) {
        // Refresh failed; fall through to full OAuth
      }
    }

    const result = await runOAuth(clientId, redirectUri);
    return result;
  }

  function songToUri(song) {
    if (!song) return null;
    if (song.spotifyUri && String(song.spotifyUri).indexOf('spotify:track:') === 0) {
      return song.spotifyUri;
    }
    if (song.spotifyId) return 'spotify:track:' + song.spotifyId;
    const uri = String(song.spotifyUri || '');
    const match = uri.match(/track\/([a-zA-Z0-9]+)/);
    return match ? 'spotify:track:' + match[1] : null;
  }

  function collectUris(playlistData) {
    const songs = playlistData && playlistData.playlist && Array.isArray(playlistData.playlist.songs)
      ? playlistData.playlist.songs
      : [];
    return songs.map(songToUri).filter(Boolean);
  }

  async function spotifyFetch(path, options) {
    const tokens = await getValidToken();
    const response = await fetch('https://api.spotify.com/v1' + path, {
      method: options.method || 'GET',
      headers: {
        Authorization: 'Bearer ' + tokens.accessToken,
        'Content-Type': 'application/json'
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (response.status === 401 && tokens.refreshToken) {
      const refreshed = await refreshAccessToken(SPOTIFY_CLIENT_ID, tokens.refreshToken);
      await setTokens(
        refreshed.access_token,
        refreshed.refresh_token || tokens.refreshToken,
        refreshed.expires_in || 3600
      );
      const retry = await fetch('https://api.spotify.com/v1' + path, {
        method: options.method || 'GET',
        headers: {
          Authorization: 'Bearer ' + refreshed.access_token,
          'Content-Type': 'application/json'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      if (!retry.ok) {
        throw new Error('Spotify request failed: ' + retry.status + ' ' + (await retry.text()));
      }
      return retry.status === 204 ? {} : retry.json();
    }
    if (!response.ok) {
      throw new Error('Spotify request failed: ' + response.status + ' ' + (await response.text()));
    }
    return response.status === 204 ? {} : response.json();
  }

  async function addUrisToPlaylist(playlistId, uris) {
    let added = 0;
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100);
      await spotifyFetch('/playlists/' + encodeURIComponent(playlistId) + '/tracks', {
        method: 'POST',
        body: { uris: batch }
      });
      added += batch.length;
    }
    return added;
  }

  async function createUserPlaylist(playlistData) {
    const playlist = (playlistData && playlistData.playlist) || {};
    const created = await spotifyFetch('/me/playlists', {
      method: 'POST',
      body: {
        name: playlist.name || 'AI Generated Playlist',
        description: playlist.description || 'Generated by AI',
        public: false
      }
    });
    const uris = collectUris(playlistData);
    const tracksAdded = await addUrisToPlaylist(created.id, uris);
    const totalTracks = playlist.songs ? playlist.songs.length : uris.length;
    return {
      playlistUrl: created.external_urls && created.external_urls.spotify
        ? created.external_urls.spotify
        : 'https://open.spotify.com/playlist/' + created.id,
      playlistId: created.id,
      tracksAdded: tracksAdded,
      totalTracks: totalTracks
    };
  }

  async function addToUserPlaylist(playlistId, playlistData) {
    if (!playlistId) throw new Error('Missing playlist id');
    const playlist = (playlistData && playlistData.playlist) || {};
    const uris = collectUris(playlistData);
    if (!uris.length) throw new Error('No Spotify-verified tracks to add');
    const tracksAdded = await addUrisToPlaylist(playlistId, uris);
    return {
      playlistUrl: 'https://open.spotify.com/playlist/' + playlistId,
      playlistId: playlistId,
      tracksAdded: tracksAdded,
      totalTracks: playlist.songs ? playlist.songs.length : uris.length
    };
  }

  chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
    if (request.type === 'getSpotifyToken') {
      getValidToken()
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }
    if (request.type === 'createSpotifyPlaylist') {
      createUserPlaylist(request.playlistData)
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }
    if (request.type === 'addToSpotifyPlaylist') {
      addToUserPlaylist(request.playlistId, request.playlistData)
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }
  });
})();
