// Resolves the active Backoffice environment and project from a supplied catalog.
(function () {
    'use strict';

    function resolveCurrentPage(catalog) {
        if (!catalog || !catalog.instances || !catalog.projects) {
            throw new Error('[BO_CONTEXT] A valid catalog is required');
        }

        const hostname = window.location.hostname;

        for (const [instanceId, instance] of Object.entries(catalog.instances)) {
            const projectId = instance.hosts && instance.hosts[hostname];

            if (!projectId) {
                continue;
            }

            const project = catalog.projects[projectId];

            if (!project) {
                throw new Error(
                    `[BO_CONTEXT] Host ${hostname} references unknown project: ${projectId}`
                );
            }

            return {
                instance: instanceId,
                project: projectId,
                baseUrl: window.location.origin,
                workspaceProjectId: project.workspaceProjectId || null
            };
        }

        throw new Error(
            `[BO_CONTEXT] No configured Backoffice context for hostname: ${hostname}`
        );
    }

    function apiUrl(context, path) {
        if (!context || !context.baseUrl) {
            throw new Error('[BO_CONTEXT] Context baseUrl is required');
        }

        return new URL(path, `${context.baseUrl}/`).toString();
    }

    window.BOContext = {
        resolveCurrentPage,
        apiUrl
    };
})();
