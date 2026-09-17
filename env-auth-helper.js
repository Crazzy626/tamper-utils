// env-auth-helper.js
(function () {

    'use strict';


    // ============================================================
    // GET CREDENTIALS
    // ============================================================

    function getEnvCredentials(
        instance,
        role
    ) {

        if (
            !unsafeWindow.TMG_CREDENTIALS
        ) {

            throw new Error(
                'TMG credential store is not available. ' +
                'Make sure TMG CREDENTIALS SETUP userscript is installed and enabled.'
            );
        }


        const credentials =
            unsafeWindow.TMG_CREDENTIALS.get(
                instance,
                role
            );


        if (!credentials) {

            throw new Error(
                `No credentials found for ${instance}/${role}`
            );
        }


        return credentials;
    }


    // ============================================================
    // AUTHENTICATE
    // ============================================================

    window.authenticateAs =
        async function (
            instance,
            role
        ) {

            const credentials =
                getEnvCredentials(
                    instance,
                    role
                );


            console.log(
                '[ENV_AUTH]',
                `Authenticating ${instance}/${role}: ${credentials.email}`
            );


            const auth =
                JwtAuth(
                    instance,
                    credentials.email,
                    credentials.password
                );


            const token =
                await auth.checkAndRefreshToken();


            if (!token) {

                throw new Error(
                    `Authentication failed for ${instance}/${role}`
                );
            }


            console.log(
                '[ENV_AUTH]',
                `Authentication successful: ${instance}/${role}`
            );


            return token;
        };


    // ============================================================
    // PUBLIC GETTER
    // ============================================================

    window.getEnvCredentials =
        getEnvCredentials;


})();
