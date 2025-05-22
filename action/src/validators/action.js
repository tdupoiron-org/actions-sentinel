const core = require('@actions/core');

async function validateAction(actionRef) {
    if (!actionRef) {
        throw new Error('Action reference is required');
    }

    // Basic format validation xxx/xxx@xxx
    const actionPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+@[a-zA-Z0-9._-]+$/;
    if (!actionPattern.test(actionRef)) {
        throw new Error(`Invalid action reference format for "${actionRef}". Expected format: owner/repo@ref`);
    }

    // Additional validation could be added here
    // For example:
    // - Check if version is a valid semver
    // - Check if action exists in marketplace
    // - Check if action is verified

    return true;
}

module.exports = {
    validateAction
};
