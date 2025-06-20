// jwt-auth-helper.js (UMD version)
// last updated: 20.06.2025
// Convert to UMD (Universal Module Definition)
// Since @require does not support ES Modules directly, you must convert this package to UMD or plain global script. Here's how

// SCOPE: generate AUT Bearer token and set to GM_setValue(TOKEN_KEY, json.token);

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.JwtAuth = factory();
    }
})(this, function () {

    const TOKEN_KEY = 'jwt_token';

    return function JwtAuth(instance, email, password) {
        const LOGIN_URL = `https://${instance}-bo.travelbusinessclass.com/jwt/auth/local/login`;
        const LOGIN_PAYLOAD = {
            email,
            password,
            rememberMe: true
        };

        function parseJwt(token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        }

        async function checkAndRefreshToken() {
            let token = GM_getValue(TOKEN_KEY);

            if (!token) {
                console.warn("🚫 No token found. Generating new...");
                await generateNewToken();
                return;
            }

            try {
                const payload = parseJwt(token);
                const now = Math.floor(Date.now() / 1000);
                const expiresIn = payload.exp - now;

                console.log("Token expires in", expiresIn, "seconds");

                if (expiresIn <= 0) {
                    console.warn("🚫 Token expired. Generating new...");
                    await generateNewToken();
                } else if (expiresIn < 60) {
                    console.warn("⚠️ Token about to expire in less than 1 minute.");
                } else {
                    console.log("✅ Token is still valid.");
                }
            } catch (e) {
                console.error("⚠️ Failed to parse token. Generating new...", e);
                await generateNewToken();
            }
        }

        async function generateNewToken() {
            try {
                const response = await fetch(LOGIN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(LOGIN_PAYLOAD)
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const json = await response.json();
                if (json.token) {
                    console.log("✅ New token received:", json.token);
                    GM_setValue(TOKEN_KEY, json.token);
                } else {
                    console.error("❌ Token not found in response:", json);
                }
            } catch (error) {
                console.error("❌ Login request failed:", error);
            }
        }

        return {
            checkAndRefreshToken,
            generateNewToken,
            getToken: () => GM_getValue(TOKEN_KEY),
        };
    };
});
