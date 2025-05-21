# actions-sentinel

A security-focused tool for evaluating and managing GitHub Actions in a controlled, automated workflow using IssueOps and GitOps principles.

## Overview

This repository provides a secure way to manage which GitHub Actions are allowed to be used within your organization. It implements a controlled process where actions must be approved before they can be used in workflows, helping to maintain security and prevent potential risks from untrusted actions.

## Features

- **IssueOps-based Workflow**: Uses GitHub Issues for requesting action whitelisting
- **Automated Security Evaluation**: Reviews GitHub Actions for security concerns before approval
- **GitOps Implementation**: Maintains whitelist through version-controlled configuration
- **Standardized Request Process**: Structured issue templates for action whitelisting requests
- **CLI Interface**: Programmatic interface to manage action whitelisting

## Usage

### As a GitHub Action

You can use this action in your workflows to evaluate GitHub Actions:

```yaml
- name: Evaluate Action
  uses: ./sentinel
  with:
    action-name: 'owner/repo@version'
    organization: 'your-org-name'
    github-token: ${{ secrets.GITHUB_TOKEN }}  # Token needs admin:org permissions
```

> **Note**: The GitHub token provided must have `admin:org` permissions to manage organization settings. The default `GITHUB_TOKEN` may not have sufficient permissions - you might need to use a Personal Access Token (PAT) with the required permissions.

### Workflow Permissions

When using this action in a GitHub Actions workflow, make sure to set the following permissions:

```yaml
permissions:
  issues: write     # If you need to update issues
  actions: write    # Required for managing GitHub Actions settings
  contents: read    # Required for checking out code
```

The action requires a GitHub token with `admin:org` permissions to manage organization settings. If the default `GITHUB_TOKEN` doesn't have sufficient permissions, you'll need to create and use a Personal Access Token (PAT) with the required permissions:

```yaml
- name: Evaluate Action
  uses: ./sentinel
  with:
    action-name: 'owner/repo@version'
    organization: ${{ github.repository_owner }}
    github-token: ${{ secrets.YOUR_PAT_WITH_ADMIN_ORG }}  # Token with admin:org permissions
```

### Web Interface

To request a new GitHub Action to be whitelisted through the web interface:

1. Go to the "Issues" tab
2. Click "New Issue"
3. Select "GitHub Actions Whitelist Request"
4. Fill in the required information:
   - Action reference in the format: `owner/action@version`
   - Detailed justification for the action
   - Confirm security review acknowledgments

### Programmatic Usage

To use the actions-sentinel programmatically:

1. Set up environment variables:
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your values
   GITHUB_TOKEN=your_github_token_here
   GITHUB_ORGANIZATION=your_organization_name
   ```

2. Use as a Node.js module:
   ```javascript
   const { addActionToWhitelist } = require('./sentinel');
   
   // Add action to whitelist
   await addActionToWhitelist('trufflesecurity/trufflehog@v3.88.32');
   ```

   Note: If the organization already has all actions enabled, the function will detect this and return successfully without making any changes.

3. Use from command line:
   ```bash
   node sentinel/index.js trufflesecurity/trufflehog@v3.88.32
   ```

### Organization Settings Behavior

The tool intelligently handles different organization settings:

1. **Restricted Actions**: In this mode, the tool will add specific actions to the organization's whitelist.

2. **All Actions Allowed**: If the organization is configured to allow all actions, the tool will:
   - Detect this setting automatically
   - Skip the whitelist modification (as it's not needed)
   - Return successfully with an appropriate message

This behavior ensures the tool works correctly regardless of the organization's actions permissions configuration.

### Build Process

The action is automatically built and bundled using @vercel/ncc when changes are pushed to the repository. The build workflow:

1. Installs dependencies
2. Bundles the code into a single file
3. Commits the updated dist folder

The build process is handled by the GitHub Actions workflow in `.github/workflows/build.yml`.

## Workflows

### Build Workflow

Located in `.github/workflows/build.yml`, this workflow automatically builds and bundles the action code:
- Triggers on pushes to the sentinel directory
- Uses Node.js 16
- Bundles the code with dependencies
- Commits the updated dist directory

### Action Whitelist Request Handler

Located in `.github/workflows/whitelist-request.yml`, this workflow processes action whitelist requests:
- Triggers on new or edited issues with the 'actions-whitelist-request' label
- Extracts the action reference from the issue body
- Uses the Actions Sentinel to evaluate the action for security concerns
- Posts evaluation results as a comment on the issue
- Updates the issue title to indicate review status

The workflow integrates our Actions Sentinel directly to evaluate each requested action:
```yaml
- name: Evaluate Action
  uses: ./sentinel
  with:
    action-name: ${{ steps.extract.outputs.result }}
```

## How It Works

1. **Request Process**:
   - Developers submit requests to whitelist new actions using the provided issue template
   - Each request must include:
     - Action reference (owner/action@version)
     - Justification for use
     - Security acknowledgments

2. **Security Review**:
   - Automated evaluation of the requested action
   - Review of action's source code and operations
   - Assessment of security implications

3. **Approval and Implementation**:
   - Actions that pass security review are added to the whitelist
   - Changes are implemented through GitOps practices
   - Automated updates to action configurations

## Whitelist Management

The system maintains a cumulative whitelist of approved actions. When adding a new action:

1. The system checks if all actions are already allowed at the organization level
2. If not, it retrieves the current whitelist configuration
3. Verifies if the requested action is already whitelisted
4. If not present, adds the new action while preserving all existing approved actions

This ensures that:
- No approved actions are accidentally removed
- Duplicate entries are prevented
- Existing organization settings are preserved

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/actions-sentinel.git
   cd actions-sentinel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

Note: The `.gitignore` file is configured to exclude:
- Node.js dependencies (`node_modules/`)
- Environment files (`.env`)
- System files (`.DS_Store`)
- IDE specific files (`.vscode/`, `.idea/`)
- Logs and runtime data

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
