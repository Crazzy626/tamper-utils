// jwt-auth-helper.js 
// (UMD version) Convert to UMD (Universal Module Definition)
// SCOPE: generate AUT Bearer token and set to GM_setValue(TOKEN_KEY, json.token)
// Since @require does not support ES Modules directly, you must convert this package to UMD or plain global script
// update-1: 20.06.2025
// last-update: 14.09.2026 - Updated for TMG BO dev-md environment
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.JwtAuth = factory();
    }
})(this, function () {

    const TOKEN_KEY = 'jwt_token';

    return function JwtAuth(instance, email, password) {

        const BASE_URL = `https://${instance}-tmg-bo.dev-md.tmgbo.com`;
        const LOGIN_URL = `${BASE_URL}/jwt/auth/local/login`;

        const LOGIN_PAYLOAD = {
            email,
            password,
            rememberMe: true
        };

        function parseJwt(token) {
            if (!token || typeof token !== 'string') {
                throw new Error('Invalid or empty JWT token');
            }

            const parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const base64Url = parts[1];

            const base64 = base64Url
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c =>
                        '%' +
                        ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join('')
            );

            return JSON.parse(jsonPayload);
        }

        async function checkAndRefreshToken() {

            let token = await GM_getValue(TOKEN_KEY);

            if (!token) {
                console.warn("🚫 No token found. Generating new...");
                return await generateNewToken();
            }

            try {

                const payload = parseJwt(token);

                const now = Math.floor(Date.now() / 1000);
                const expiresIn = payload.exp - now;

                console.log("Token expires in", expiresIn, "seconds");

                if (expiresIn <= 0) {

                    console.warn("🚫 Token expired. Generating new...");

                    return await generateNewToken();

                } else if (expiresIn < 60) {

                    console.warn(
                        "⚠️ Token about to expire in less than 1 minute."
                    );

                    return token;

                } else {

                    console.log("✅ Token is still valid.");

                    return token;
                }

            } catch (e) {

                console.error(
                    "⚠️ Failed to parse token. Generating new...",
                    e
                );

                return await generateNewToken();
            }
        }

        async function generateNewToken() {

            console.log("🔐 Generating new JWT token");
            console.log("🔐 Login URL:", LOGIN_URL);

            try {

                const response = await fetch(LOGIN_URL, {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(LOGIN_PAYLOAD)
                });

                if (!response.ok) {

                    let responseBody = '';

                    try {
                        responseBody = await response.text();
                    } catch (_) {
                        responseBody = '<unable to read response body>';
                    }

                    throw new Error(
                        `Login failed: HTTP ${response.status} ${response.statusText}` +
                        (responseBody ? ` | ${responseBody}` : '')
                    );
                }

                const json = await response.json();

                if (!json.token) {
                    throw new Error(
                        'Login succeeded but response does not contain token'
                    );
                }

                await GM_setValue(TOKEN_KEY, json.token);

                console.log("✅ New token received and stored");

                return json.token;

            } catch (error) {

                console.error(
                    "❌ Login request failed:",
                    error
                );

                // IMPORTANT:
                // Do not swallow the error.
                throw error;
            }
        }

        return {
            checkAndRefreshToken,
            generateNewToken,
            getToken: () => GM_getValue(TOKEN_KEY),
        };
    };
});
