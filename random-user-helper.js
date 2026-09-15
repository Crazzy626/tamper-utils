// random-user-helper.js
(function () {
    'use strict';

    const RANDOM_USER_API =
        'https://randomuser.me/api/?nat=us,ca,gb,fr';

    const EMAIL_DOMAINS = [
        'gmail.com',
        'mail.com',
        'hotmail.com',
        'live.com',
        'outlook.com'
    ];

    function getRandomElement(arr) {
        return arr[
            Math.floor(Math.random() * arr.length)
        ];
    }

    window.getRandomUser = async function () {
        try {
            const response = await fetch(RANDOM_USER_API);

            if (!response.ok) {
                throw new Error(
                    `Random User API HTTP ${response.status}`
                );
            }

            const data = await response.json();

            if (
                !data.results ||
                !data.results.length
            ) {
                throw new Error(
                    'Random User API returned no users'
                );
            }

            const user = data.results[0];

            const randomDomain =
                getRandomElement(EMAIL_DOMAINS);

            return {
                first_name: user.name.first,
                last_name: user.name.last,

                email:
                    user.login.username.toLowerCase() +
                    '@' +
                    randomDomain,

                phone:
                    user.phone.replace(/[^0-9]/g, '') +
                    '01',

                original: user
            };

        } catch (error) {

            console.error(
                '[RANDOM_USER] Failed to fetch random user:',
                error
            );

            return null;
        }
    };

})();
