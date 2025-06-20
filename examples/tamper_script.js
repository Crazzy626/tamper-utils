// ==UserScript==
// @name         Example Usage
// @namespace    http://tampermonkey.net/
// @version      0.1
// @require      https://cdn.jsdelivr.net/gh/yourusername/tamper-utils@latest/jwt-auth-helper.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const auth = JwtAuth("staging", "admin@tbc.loc", "tbc@040");

    auth.checkAndRefreshToken().then(() => {
        const token = auth.getToken();
        console.log("Token in use:", token);
        // Use it for your authenticated requests
    });
})();
