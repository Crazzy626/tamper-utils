// toast-helper.js
(function () {
    'use strict';

    let toastTimer = null;

    window.showToast = function (message, duration = 2500) {
        let toast = document.getElementById('tamper-utils-toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'tamper-utils-toast';

            toast.style.position = 'fixed';
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.zIndex = '2147483647';
            toast.style.padding = '8px 14px';
            toast.style.borderRadius = '5px';
            toast.style.background = 'rgba(25, 25, 25, 0.92)';
            toast.style.color = '#ffffff';
            toast.style.fontFamily = 'Arial, sans-serif';
            toast.style.fontSize = '13px';
            toast.style.fontWeight = '500';
            toast.style.lineHeight = '18px';
            toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.35)';
            toast.style.pointerEvents = 'none';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.15s ease';

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';

        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(function () {
            toast.style.opacity = '0';
        }, duration);
    };
})();
