const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

async function addActionToWhitelist(actionRef) {
    try {
        const { owner, repo, version } = await validateActionReference(actionRef);

        // Initialize Octokit with PAT from environment variable
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Get the organization settings for allowed actions
        const organization = process.env.GITHUB_ORGANIZATION;
        if (!organization) {
            throw new Error('GITHUB_ORGANIZATION environment variable is not set');
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

// If running directly from command line
if (require.main === module) {
    const actionRef = process.argv[2];
    if (!actionRef) {
        console.error('Please provide an action reference as an argument');
        process.exit(1);
    }

    addActionToWhitelist(actionRef)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}