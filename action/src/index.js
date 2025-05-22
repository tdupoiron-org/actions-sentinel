const core = require('@actions/core');
const { validateAction } = require('./validators/action');
const { GitHubAPI } = require('./github/api');
const { Octokit } = require('@octokit/rest');

async function validateActionReference(actionRef) {
    // Validate format: owner/repo@version
    const pattern = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+@[a-zA-Z0-9.\-_]+$/;
    if (!pattern.test(actionRef)) {
        throw new Error('Invalid action reference format. Expected: owner/repo@version');
    }

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

async function addActionToWhitelist(actionRef, organization, token) {
    let details = [];
    try {
        details.push('Validating action reference...');
        const { owner, repo, version } = await validateActionReference(actionRef);
        details.push('Action reference validated successfully');

        // Initialize Octokit with provided token
        const octokit = new Octokit({
            auth: token
        });

        if (!organization) {
            throw new Error('GitHub organization name is required');
        }

        if (!token) {
            throw new Error('GitHub token is required');
        }

        // First, check the current organization settings
        const settings = await getOrganizationActionsSettings(octokit, organization);
        
        // If all actions are already allowed, no need to add to whitelist
        if (settings.enabled_repositories === "all" && settings.allowed_actions === "all") {
            console.log('All actions are already allowed in this organization. No need to add to whitelist.');
            return true;
        }

        // Get current allowed patterns and settings
        const currentSettings = await getCurrentAllowedPatterns(octokit, organization);
        const newPattern = `${owner}/${repo}@${version}`;

        // Check if the pattern is already in the whitelist
        if (currentSettings.patterns.includes(newPattern)) {
            console.log(`Action ${actionRef} is already in the whitelist.`);
            return true;
        }

        // Update organization settings to allow the specific action while preserving existing patterns
        try {
            await octokit.request('PUT /orgs/{org}/actions/permissions/selected-actions', {
                org: organization,
                github_owned_allowed: currentSettings.github_owned_allowed,
                verified_allowed: currentSettings.verified_allowed,
                patterns_allowed: [...currentSettings.patterns, newPattern]
            });
            console.log(`Successfully added ${actionRef} to organization whitelist`);
        } catch (error) {
            if (error.status === 409) {
                console.log('All actions are already allowed in this organization. No need to add to whitelist.');
                return true;
            }
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error adding action to whitelist:', error.message);
        throw error;
    }
}

// Export for use in other modules
module.exports = {
    addActionToWhitelist
};

// Main function that handles both CLI and GitHub Actions contexts
async function run() {
    try {
        let actionRef;
        let organization;
        let token;
        
        // Check if running in GitHub Actions context
        if (process.env.GITHUB_ACTIONS === 'true') {
            actionRef = core.getInput('action-name', { required: true });
            organization = core.getInput('organization', { required: true });
            token = core.getInput('github-token', { required: true });
        } else {
            // Running from command line
            actionRef = process.argv[2];
            organization = process.env.GITHUB_ORGANIZATION;
            token = process.env.GITHUB_TOKEN;
            
            if (!actionRef) {
                console.error('Please provide an action reference as an argument');
                process.exit(1);
            }
            
            if (!organization) {
                console.error('GITHUB_ORGANIZATION environment variable is not set');
                process.exit(1);
            }

            if (!token) {
                console.error('GITHUB_TOKEN environment variable is not set');
                process.exit(1);
            }
        }

        const result = await addActionToWhitelist(actionRef, organization, token);
        
        if (process.env.GITHUB_ACTIONS === 'true') {
            core.setOutput('status', 'success');
            core.setOutput('result', JSON.stringify({
                actionName: actionRef,
                organization,
                whitelistStatus: result ? 'added' : 'already_exists',
                timestamp: new Date().toISOString()
            }));
            core.setOutput('details', `Action ${actionRef} has been processed successfully for the whitelist`);
        }
    } catch (error) {
        if (process.env.GITHUB_ACTIONS === 'true') {
            core.setOutput('status', 'failure');
            core.setOutput('result', JSON.stringify({
                error: error.message,
                timestamp: new Date().toISOString()
            }));
            core.setOutput('details', error.stack || error.message);
            core.setFailed(error.message);
        } else {
            console.error(error);
            process.exit(1);
        }
    }
}

// Run if called directly
if (require.main === module) {
    run();
}