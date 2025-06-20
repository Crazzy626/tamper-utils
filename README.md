# 🛠️ tamper-utils

A growing collection of reusable helper utilities for Tampermonkey userscripts.

---

## 🌐 CDN Hosting

All scripts in this repository are served via [jsDelivr CDN](https://www.jsdelivr.com/).

### ✅ Usage in Tampermonkey

To import any helper into your Tampermonkey script, use:

```javascript
// @require https://cdn.jsdelivr.net/gh/yourusername/tamper-utils@latest/<script-name>.js

    Replace <script-name>.js with the desired file, e.g. jwt-auth-helper.js

📦 Available Modules
1. jwt-auth-helper.js – 🔐 JWT Auth Helper

A utility for managing JWT authentication tokens in Tampermonkey scripts for TravelBusinessClass back office panels.
✅ Features

    Logs in using email/password and retrieves a JWT token

    Saves token using GM_setValue and retrieves it with GM_getValue

    Automatically refreshes the token if expired or near expiry

    Provides getToken() method for authenticated requests

🚀 How to Use

1. Include in your Tampermonkey userscript:

// @require https://cdn.jsdelivr.net/gh/yourusername/tamper-utils@latest/jwt-auth-helper.js
// @grant   GM_getValue
// @grant   GM_setValue

2. Initialize and use:

const auth = JwtAuth("staging", "admin@tbc.loc", "tbc@040");

auth.checkAndRefreshToken().then(() => {
    const token = auth.getToken();
    console.log("✅ Token:", token);

    // Example: authenticated API request
    fetch("https://staging-bo.travelbusinessclass.com/api/protected", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => console.log("Protected data:", data));
});

🛠 Required Tampermonkey Permissions

Make sure to declare the following in your script's metadata block:

// @grant GM_getValue
// @grant GM_setValue

🧩 Coming Soon

    dom-utils.js – DOM selection, mutation, and event helpers

    ui-injector.js – UI widgets and modals for Tampermonkey overlays

    storage-tools.js – Sync/local storage abstraction for persistent state

📄 License

MIT License — free to use, modify, and contribute.


Let me know if you'd like me to generate a sample `dom-utils.js` or the UMD version of it for future modules.

