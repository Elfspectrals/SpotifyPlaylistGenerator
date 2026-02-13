(function () {
  const STORAGE_KEY_CLIENT_ID = 'byoClientId';

  const clientIdInput = document.getElementById('client-id');
  const redirectUriInput = document.getElementById('redirect-uri');
  const copyRedirectBtn = document.getElementById('copy-redirect');
  const saveBtn = document.getElementById('save');
  const openDashboardBtn = document.getElementById('open-dashboard');
  const statusEl = document.getElementById('status');

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (type || 'info');
    statusEl.style.display = 'block';
  }

  function hideStatus() {
    statusEl.style.display = 'none';
  }

  // Redirect URI from Chrome identity (extension context)
  if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getRedirectURL) {
    const redirectUrl = chrome.identity.getRedirectURL();
    redirectUriInput.value = redirectUrl;
    redirectUriInput.title = redirectUrl;
  } else {
    redirectUriInput.value = 'Load this page from the extension to see your Redirect URI.';
    redirectUriInput.placeholder = 'Open extension options from chrome://extensions';
  }

  copyRedirectBtn.addEventListener('click', function () {
    const value = redirectUriInput.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        showStatus('Redirect URI copied to clipboard.', 'success');
        setTimeout(hideStatus, 2000);
      }).catch(function () {
        fallbackCopy(value);
      });
    } else {
      fallbackCopy(value);
    }
  });

  function fallbackCopy(text) {
    redirectUriInput.select();
    try {
      document.execCommand('copy');
      showStatus('Redirect URI copied to clipboard.', 'success');
      setTimeout(hideStatus, 2000);
    } catch (e) {
      showStatus('Could not copy. Please select and copy manually.', 'error');
    }
  }

  saveBtn.addEventListener('click', function () {
    const clientId = (clientIdInput.value || '').trim();
    if (!clientId) {
      showStatus('Please enter your Spotify Client ID.', 'error');
      return;
    }
    chrome.storage.local.set({ [STORAGE_KEY_CLIENT_ID]: clientId }, function () {
      showStatus('Settings saved. You can use the extension on Spotify.', 'success');
      setTimeout(hideStatus, 3000);
    });
  });

  openDashboardBtn.addEventListener('click', function () {
    window.open('https://developer.spotify.com/dashboard', '_blank', 'noopener');
  });

  // Load saved Client ID
  chrome.storage.local.get([STORAGE_KEY_CLIENT_ID], function (result) {
    if (result[STORAGE_KEY_CLIENT_ID]) {
      clientIdInput.value = result[STORAGE_KEY_CLIENT_ID];
    }
  });
})();
