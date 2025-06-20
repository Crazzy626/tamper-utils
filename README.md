# tamper-utils
helper utilities for tamper monkey scripts

# Uses https://www.jsdelivr.com as CDN

Create CDN link to be used in tamper monkey script

// @require https://cdn.jsdelivr.net/gh/yourusername/tamper-utils@latest/jwt-auth-helper.js


# jwt-authhelper.js

🔐 JWT Auth Helper

A utility to manage JWT token authentication for TravelBusinessClass admin panels in Tampermonkey scripts.

📦 File

jwt-auth-helper.js

✅ Features

    Logs in using email/password and retrieves JWT token

    Saves token with GM_setValue for reuse

    Automatically refreshes token if expired or near expiry

    Provides getToken() method for usage in API calls

🚀 How to Use in Tampermonkey

1. Include in your userscript:

// @require https://cdn.jsdelivr.net/gh/yourusername/tamper-utils@latest/jwt-auth-helper.js
// @grant   GM_getValue
// @grant   GM_setValue

2. Initialize and use:

const auth = JwtAuth("staging", "admin@tbc.loc", "tbc@040");

auth.checkAndRefreshToken().then(() => {
    const token = auth.getToken();
    console.log("✅ Token:", token);
    
    // Example: authenticated fetch
    fetch("https://staging-bo.travelbusinessclass.com/api/protected", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.json())
      .then(data => console.log("Protected data:", data));
});

🛠 Dependencies

This script relies on the following Tampermonkey APIs:

    GM_getValue

    GM_setValue

Ensure they are declared in your userscript’s metadata block.
