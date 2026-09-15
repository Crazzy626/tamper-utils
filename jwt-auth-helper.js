// jwt-auth-helper.js
// UMD version
// Generates AUT Bearer token and stores it in GM_setValue(TOKEN_KEY, token)
//
// update-1: 20.06.2025
// last-update: 14.09.2026
// Updated for TMG BO dev-md environment
// TAG: jwt-auth-202609141930
// IMPORTANT:
// Login uses GM_xmlhttpRequest instead of fetch()
// to avoid browser CORS restrictions.

(function (root, factory) {

    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.JwtAuth = factory();
    }

})(this, function () {

    const TOKEN_KEY = 'jwt_token';

    return function JwtAuth(instance, email, password) {

        // DEBUG VERSION NR.
        console.log('[JWT_HELPER] NEW DEV-MD HELPER LOADED - 2026-09-14');

        // ========================================================
        // URLS
        // ========================================================

        const BASE_URL =
            `https://${instance}-tmg-bo.dev-md.tmgbo.com`;

        const LOGIN_URL =
            `${BASE_URL}/jwt/auth/local/login`;


        // ========================================================
        // LOGIN PAYLOAD
        // ========================================================

        const LOGIN_PAYLOAD = {
            email,
            password,
            rememberMe: true
        };


        // ========================================================
        // JWT PARSER
        // ========================================================

        function parseJwt(token) {

            if (!token || typeof token !== 'string') {
                throw new Error(
                    'Invalid or empty JWT token'
                );
            }

            const parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error(
                    'Invalid JWT format'
                );
            }

            const base64Url = parts[1];

            const base64 =
                base64Url
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');

            const jsonPayload =
                decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c =>
                            '%' +
                            ('00' +
                                c.charCodeAt(0)
                                    .toString(16))
                                .slice(-2)
                        )
                        .join('')
                );

            return JSON.parse(jsonPayload);
        }


        // ========================================================
        // CHECK / REFRESH TOKEN
        // ========================================================

        async function checkAndRefreshToken() {

            const token =
                await GM_getValue(TOKEN_KEY);

            // ----------------------------------------------------
            // No token
            // ----------------------------------------------------

            if (!token) {

                console.warn(
                    '🚫 No token found. Generating new...'
                );

                return await generateNewToken();
            }


            // ----------------------------------------------------
            // Validate existing token
            // ----------------------------------------------------

            try {

                const payload =
                    parseJwt(token);

                const now =
                    Math.floor(Date.now() / 1000);

                const expiresIn =
                    payload.exp - now;

                console.log(
                    'Token expires in',
                    expiresIn,
                    'seconds'
                );


                // ------------------------------------------------
                // Expired
                // ------------------------------------------------

                if (expiresIn <= 0) {

                    console.warn(
                        '🚫 Token expired. Generating new...'
                    );

                    return await generateNewToken();
                }


                // ------------------------------------------------
                // Almost expired
                // ------------------------------------------------

                if (expiresIn < 60) {

                    console.warn(
                        '⚠️ Token about to expire in less than 1 minute.'
                    );

                    return token;
                }


                // ------------------------------------------------
                // Valid
                // ------------------------------------------------

                console.log(
                    '✅ Token is still valid.'
                );

                return token;

            } catch (error) {

                console.error(
                    '⚠️ Failed to parse token. Generating new...',
                    error
                );

                return await generateNewToken();
            }
        }


        // ========================================================
        // GENERATE NEW TOKEN
        // ========================================================

        function generateNewToken() {

            console.log(
                '🔐 Generating new JWT token'
            );

            console.log(
                '🔐 Login URL:',
                LOGIN_URL
            );

            return new Promise((resolve, reject) => {

                GM_xmlhttpRequest({

                    method: 'POST',

                    url: LOGIN_URL,

                    headers: {
                        'Content-Type':
                            'application/json',

                        'Accept':
                            'application/json'
                    },

                    data:
                        JSON.stringify(
                            LOGIN_PAYLOAD
                        ),


                    // ==========================================
                    // SUCCESS / HTTP RESPONSE
                    // ==========================================

                    onload: async function (response) {

                        console.log(
                            '🔐 Login HTTP status:',
                            response.status
                        );


                        // --------------------------------------
                        // HTTP ERROR
                        // --------------------------------------

                        if (
                            response.status < 200 ||
                            response.status >= 300
                        ) {

                            console.error(
                                '❌ Login HTTP error:',
                                response.status
                            );

                            console.error(
                                '❌ Login response:',
                                response.responseText
                            );

                            reject(
                                new Error(
                                    `Login failed: HTTP ${response.status}` +
                                    (
                                        response.responseText
                                            ? ` | ${response.responseText}`
                                            : ''
                                    )
                                )
                            );

                            return;
                        }


                        // --------------------------------------
                        // Parse response
                        // --------------------------------------

                        let json;

                        try {

                            json =
                                JSON.parse(
                                    response.responseText
                                );

                        } catch (error) {

                            console.error(
                                '❌ Failed to parse login response:',
                                error
                            );

                            console.error(
                                '❌ Raw login response:',
                                response.responseText
                            );

                            reject(
                                new Error(
                                    'Login succeeded but response is not valid JSON'
                                )
                            );

                            return;
                        }


                        // --------------------------------------
                        // Token missing
                        // --------------------------------------

                        if (!json.token) {

                            console.error(
                                '❌ Login succeeded but no token found:',
                                json
                            );

                            reject(
                                new Error(
                                    'Login succeeded but response does not contain token'
                                )
                            );

                            return;
                        }


                        // --------------------------------------
                        // Store token
                        // --------------------------------------

                        try {

                            await GM_setValue(
                                TOKEN_KEY,
                                json.token
                            );

                        } catch (error) {

                            console.error(
                                '❌ Failed to store JWT token:',
                                error
                            );

                            reject(error);

                            return;
                        }


                        // --------------------------------------
                        // Success
                        // --------------------------------------

                        console.log(
                            '✅ New token received and stored'
                        );

                        resolve(
                            json.token
                        );
                    },


                    // ==========================================
                    // NETWORK ERROR
                    // ==========================================

                    onerror: function (error) {

                        console.error(
                            '❌ Login network error:',
                            error
                        );

                        reject(
                            new Error(
                                'Login request network error'
                            )
                        );
                    },


                    // ==========================================
                    // TIMEOUT
                    // ==========================================

                    ontimeout: function () {

                        console.error(
                            '❌ Login request timed out'
                        );

                        reject(
                            new Error(
                                'Login request timeout'
                            )
                        );
                    }

                });

            });
        }


        // ========================================================
        // PUBLIC API
        // ========================================================

        return {

            checkAndRefreshToken,

            generateNewToken,

            getToken: () =>
                GM_getValue(TOKEN_KEY)
        };
    };
});
