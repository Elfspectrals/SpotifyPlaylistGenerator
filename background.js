(function () {
  const STORAGE_KEYS = {
    CLIENT_ID: 'byoClientId',
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
        [STORAGE_KEYS.CLIENT_ID, STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.TOKEN_EXPIRY],
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
    const clientId = stored[STORAGE_KEYS.CLIENT_ID];
    if (!clientId) {
      return { needSettings: true };
    }

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

  chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
    if (request.type === 'getSpotifyToken') {
      getValidToken()
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ error: err.message });
        });
      return true;
    }
  });
})();
