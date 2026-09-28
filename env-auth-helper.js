// env-auth-helper.js
(function () {
    'use strict';

    function normalizeContext(contextOrInstance, role) {
        if (typeof contextOrInstance === 'object') {
            return contextOrInstance;
        }

        return {
            instance: contextOrInstance,
            userId: role
        };
    }

    function getEnvCredentials(contextOrInstance, role) {
        const context = normalizeContext(contextOrInstance, role);

        const provider = unsafeWindow.TMG_CREDENTIALS_V2;

        if (!provider || provider.apiVersion < 2) {
            throw new Error(
                'TMG credential store is not available. ' +
                'Make sure TMG CREDENTIALS SETUP V2 userscript is installed and enabled.'
            );
        }

        const credentials = provider.get(context);

        if (!credentials) {
            throw new Error(
                `No credentials found for ${context.instance}/${context.project || 'default'}/${context.userId}`
            );
        }

        return credentials;
    }

    window.authenticateAs = async function (contextOrInstance, role) {
        const context = normalizeContext(contextOrInstance, role);

        const credentials = getEnvCredentials(context);
        const baseUrl = context.baseUrl || context.instance;

        console.log(
            '[ENV_AUTH]',
            `Authenticating ${context.instance}/${context.project || 'default'}/${context.userId}`
        );

        const auth = JwtAuth(
            baseUrl,
            credentials.email,
            credentials.password,
            {
                tokenKey:
                    `jwt_token:${context.instance}:${context.project || 'default'}:${context.userId}`
            }
        );

        const token = await auth.checkAndRefreshToken();

        if (!token) {
            throw new Error(
                `Authentication failed for ${context.instance}/${context.project || 'default'}/${context.userId}`
            );
        }

        console.log('[ENV_AUTH]', 'Authentication successful');

        return token;
    };

    window.getEnvCredentials = getEnvCredentials;
})();
