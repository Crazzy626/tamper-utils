// ==UserScript==
// @name         auth_test
// @description  test the JwtAuth
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        *://*.travelbusinessclass.com/*
// @require      https://cdn.jsdelivr.net/gh/Crazzy626/tamper-utils@latest/jwt-auth-helper.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// SETTINGS
const instance = "pub4";
const username = "admin@tbc.loc";
const pwd = "tbc@040";
// PROTECTED RESOURCE to be fetched in test
// const endpointUrl = "https://pub4-bo.travelbusinessclass.com/api/database/v2/Client/search?pageSize=1";
const endpointUrl = "https://pub4-bo.travelbusinessclass.com/api/database/v1/agents/AgentFormModel/35";

(function () {
    'use strict';

    // ✅ Use the global JwtAuth function (now available after @require loads)
    const auth = JwtAuth(instance, username, pwd);

    auth.checkAndRefreshToken().then(() => {
        const token = auth.getToken();
        console.log("✅ Token in use:", token);
        console.log("🚀 Fetching protected data test using Token: ", endpointUrl);

        // Example: fetch with token
        fetch(endpointUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => console.log("🔐 Protected data:", data));
    });
})();
