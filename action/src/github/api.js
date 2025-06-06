const { Octokit } = require('@octokit/rest');

// This class is responsible for interacting with the GitHub API
class GitHubAPI {
    constructor(token) {
        this.octokit = new Octokit({ auth: token });
    }

    async checkActionMetadata(owner, repo, ref) {
        try {
            const response = await this.octokit.repos.getContent({
                owner,
                repo,
                path: 'action.yml',
                ref
            });
            return true;
        } catch (error) {
            throw new Error('Unable to verify action metadata');
        }
    }
}

module.exports = {
    GitHubAPI
};
