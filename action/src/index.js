const core = require('@actions/core');
const { validateAction } = require('./validators/action');
const { GitHubAPI } = require('./github/api');
const { Octokit } = require('@octokit/rest');

async function validateActionReference(actionRef) {
    // Use the imported validator first
    await validateAction(actionRef);

    // Then parse the components
    const [ownerRepo, version] = actionRef.split('@');
    const [owner, repo] = ownerRepo.split('/');

    return { owner, repo, version };
}

async function getOrganizationActionsSettings(octokit, organization) {
    try {
        const response = await octokit.request('GET /orgs/{org}/actions/permissions', {
            org: organization
        });
        return response.data;
    } catch (error) {
        console.error('Error getting organization actions settings:', error.message);
        throw error;
    }
}

async function getCurrentAllowedPatterns(octokit, organization) {
    try {
        const response = await octokit.request('GET /orgs/{org}/actions/permissions/selected-actions', {
            org: organization
        });
        return {
            patterns: response.data.patterns_allowed || [],
            github_owned_allowed: response.data.github_owned_allowed,
            verified_allowed: response.data.verified_allowed
        };
    } catch (error) {
        console.error('Error getting current allowed patterns:', error.message);
        throw error;
    }
}

async function addActionToWhitelist(actionRef, organization, token, currentSettings) {
    const { owner, repo, version } = await validateActionReference(actionRef);
    const newPattern = `${owner}/${repo}@${version}`;

    // Check if the pattern is already in the whitelist
    if (currentSettings.patterns.includes(newPattern)) {
        console.log(`Action ${actionRef} is already in the whitelist.`);
        return currentSettings;
    }

    // Add the new pattern to the list
    return {
        ...currentSettings,
        patterns: [...currentSettings.patterns, newPattern]
    };
}

async function run() {
    try {
        // Get inputs
        const actionsInput = core.getInput('actions', { required: true });
        const organization = core.getInput('organization', { required: true });
        const token = core.getInput('github-token', { required: true });

        let details = [];
        let status = 'success';
        const actionList = actionsInput.split(',').map(a => a.trim());

        // Initialize Octokit with provided token
        const octokit = new Octokit({
            auth: token
        });

        // First, check the current organization settings
        details.push('Checking organization settings...');
        const settings = await getOrganizationActionsSettings(octokit, organization);
        
        // If all actions are already allowed, no need to add to whitelist
        if (settings.enabled_repositories === "all" && settings.allowed_actions === "all") {
            console.log('All actions are already allowed in this organization. No need to add to whitelist.');
            core.setOutput('result', { status: 'success', message: 'All actions are already allowed' });
            core.setOutput('status', 'success');
            core.setOutput('details', details);
            return;
        }

        // Get current allowed patterns and settings
        let currentSettings = await getCurrentAllowedPatterns(octokit, organization);

        // Process each action
        for (const actionRef of actionList) {
            try {
                details.push(`Validating action: ${actionRef}...`);
                currentSettings = await addActionToWhitelist(actionRef, organization, token, currentSettings);
                details.push(`Successfully validated action: ${actionRef}`);
            } catch (error) {
                console.error(`Error processing action ${actionRef}:`, error.message);
                details.push(`Error processing action ${actionRef}: ${error.message}`);
                status = 'failure';
            }
        }

        // Update organization settings with all new patterns
        try {
            await octokit.request('PUT /orgs/{org}/actions/permissions/selected-actions', {
                org: organization,
                github_owned_allowed: currentSettings.github_owned_allowed,
                verified_allowed: currentSettings.verified_allowed,
                patterns_allowed: currentSettings.patterns
            });
            details.push('Successfully updated organization whitelist');
        } catch (error) {
            if (error.status === 409) {
                console.log('All actions are already allowed in this organization.');
                details.push('All actions are already allowed in this organization');
            } else {
                throw error;
            }
        }

        // Set outputs
        core.setOutput('result', { status, patterns: currentSettings.patterns });
        core.setOutput('status', status);
        core.setOutput('details', details);

    } catch (error) {
        console.error(error);
        core.setFailed(error.message);
        throw error;
    }
}

run();