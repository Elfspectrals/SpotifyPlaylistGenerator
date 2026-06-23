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

  function formatSpotifyError(status, body) {
    if (!body) return 'Spotify request failed (HTTP ' + status + ')';
    if (typeof body === 'string') return body;
    if (body.error) {
      if (typeof body.error === 'string') return body.error;
      if (body.error.message) return body.error.message;
    }
    return JSON.stringify(body);
  }

  async function spotifyApiRequest(accessToken, path, options) {
    const url = 'https://api.spotify.com/v1' + path;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    return response;
  }

  async function resolveTrackUris(accessToken, songs) {
    const trackUris = [];

    for (const song of songs) {
      if (song.spotifyUri) {
        trackUris.push(song.spotifyUri);
        continue;
      }

      const query = 'track:"' + song.title + '" artist:"' + song.artist + '"';
      const response = await spotifyApiRequest(
        accessToken,
        '/search?q=' + encodeURIComponent(query) + '&type=track&limit=1',
        { method: 'GET', headers: {} }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(function () { return null; });
        throw new Error('Track search failed: ' + formatSpotifyError(response.status, errBody));
      }

      const data = await response.json();
      const uri = data.tracks && data.tracks.items && data.tracks.items[0] && data.tracks.items[0].uri;
      if (uri) trackUris.push(uri);
    }

    return trackUris;
  }

  async function addSongsToPlaylist(playlistId, songs) {
    if (!playlistId) {
      throw new Error('Playlist ID is missing. Open a playlist on Spotify and try again.');
    }

    const { accessToken } = await getValidToken();
    const trackUris = await resolveTrackUris(accessToken, songs);

    if (trackUris.length === 0) {
      throw new Error('No songs were found on Spotify. Check song titles and artists, then try again.');
    }

    let response = await spotifyApiRequest(
      accessToken,
      '/playlists/' + playlistId + '/tracks',
      { method: 'POST', body: JSON.stringify({ uris: trackUris }) }
    );

    if (response.status === 401) {
      const tokens = await getValidToken();
      response = await spotifyApiRequest(
        tokens.accessToken,
        '/playlists/' + playlistId + '/tracks',
        { method: 'POST', body: JSON.stringify({ uris: trackUris }) }
      );
    }

    if (!response.ok) {
      const errBody = await response.json().catch(function () { return null; });
      throw new Error(formatSpotifyError(response.status, errBody));
    }

    return {
      success: true,
      playlistId: playlistId,
      playlistUrl: 'https://open.spotify.com/playlist/' + playlistId,
      tracksAdded: trackUris.length,
      totalTracks: songs.length
    };
  }

  async function createSpotifyPlaylist(playlistData) {
    const songs = (playlistData && playlistData.songs) || [];
    const name = (playlistData && playlistData.name) || 'AI Generated Playlist';
    const description = (playlistData && playlistData.description) || 'Generated by AI';

    const { accessToken } = await getValidToken();

    const meResponse = await spotifyApiRequest(accessToken, '/me', { method: 'GET', headers: {} });
    if (!meResponse.ok) {
      const errBody = await meResponse.json().catch(function () { return null; });
      throw new Error(formatSpotifyError(meResponse.status, errBody));
    }

    const me = await meResponse.json();
    const createResponse = await spotifyApiRequest(
      accessToken,
      '/users/' + me.id + '/playlists',
      { method: 'POST', body: JSON.stringify({ name: name, description: description, public: true }) }
    );

    if (!createResponse.ok) {
      const errBody = await createResponse.json().catch(function () { return null; });
      throw new Error(formatSpotifyError(createResponse.status, errBody));
    }

    const createdPlaylist = await createResponse.json();
    const trackUris = await resolveTrackUris(accessToken, songs);

    if (trackUris.length > 0) {
      const addResponse = await spotifyApiRequest(
        accessToken,
        '/playlists/' + createdPlaylist.id + '/tracks',
        { method: 'POST', body: JSON.stringify({ uris: trackUris }) }
      );

      if (!addResponse.ok) {
        const errBody = await addResponse.json().catch(function () { return null; });
        throw new Error(formatSpotifyError(addResponse.status, errBody));
      }
    }

    return {
      success: true,
      playlistId: createdPlaylist.id,
      playlistUrl: (createdPlaylist.external_urls && createdPlaylist.external_urls.spotify) ||
        ('https://open.spotify.com/playlist/' + createdPlaylist.id),
      tracksAdded: trackUris.length,
      totalTracks: songs.length
    };
  }

  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install' || details.reason === 'update') {
      chrome.tabs.query({ url: 'https://open.spotify.com/*' }, function (tabs) {
        tabs.forEach(function (tab) {
          if (tab.id) chrome.tabs.reload(tab.id);
        });
      });
    }
  });

  chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
    if (request.type === 'getSpotifyToken') {
      getValidToken()
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }

    if (request.type === 'addSongsToPlaylist') {
      addSongsToPlaylist(request.playlistId, request.songs || [])
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }

    if (request.type === 'createSpotifyPlaylist') {
      createSpotifyPlaylist(request.playlistData || {})
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }
  });
})();
