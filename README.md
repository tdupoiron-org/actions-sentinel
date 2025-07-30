# Actions Sentinel

[![Build](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/build.yml/badge.svg)](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/build.yml) [![CodeQL](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/github-code-scanning/codeql)

A security-focused tool for evaluating and managing GitHub Actions in a controlled, automated workflow using IssueOps and GitOps principles.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Whitelist Management](#whitelist-management)
  - [Issue Flow (IssueOps)](#1-issue-flow-issueops)
  - [Git Flow (GitOps)](#2-git-flow-gitops)
  - [actions.yml Structure](#actionsyml-structure)
- [Usage](#usage)
  - [As a GitHub Action](#as-a-github-action)
  - [Workflow Permissions](#workflow-permissions)
- [Configuration](#configuration)
  - [GitHub App Setup](#github-app-setup)
  - [Repository Secrets](#repository-secrets)
- [Features](#features)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository provides a secure way to manage which GitHub Actions are allowed to be used within your organization. It implements a controlled process where actions must be approved before they can be used in workflows, helping to maintain security and prevent potential risks from untrusted actions.

## Prerequisites

Before using Actions Sentinel, ensure you have:

- **Organization Admin Access**: You need administrative permissions in your GitHub organization
- **GitHub App or Personal Access Token**: With the following permissions:
  - `admin:org` - Required for managing organization settings
  - `repo` - Required for repository access and content management
  - `issues:write` - Required for IssueOps functionality
  - `pull_requests:write` - Required for GitOps workflow
- **Node.js 16+**: Required if running the action locally
- **Actions enabled**: GitHub Actions must be enabled in your organization

## Quick Start

1. **Fork or clone this repository** to your organization
2. **Set up authentication** using either:
   - GitHub App (recommended) - see [GitHub App Setup](#github-app-setup)
   - Personal Access Token with `admin:org` permissions
3. **Configure repository secrets** as described in [Repository Secrets](#repository-secrets)
4. **Start managing your whitelist** using either:
   - [Issue Flow (IssueOps)](#1-issue-flow-issueops) - Create issues to request action approvals
   - [Git Flow (GitOps)](#2-git-flow-gitops) - Submit pull requests to modify the whitelist directly

## Architecture

Actions Sentinel operates through an automated workflow:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Request       │    │   Evaluation     │    │   Application       │
│                 │    │                  │    │                     │
│ • Issue created │───▶│ • Security scan  │───▶│ • Whitelist updated │
│ • PR submitted  │    │ • Policy check   │    │ • Org settings      │
│                 │    │ • Auto approval  │    │   synchronized      │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

### Workflow Steps

1. **Request Submission**: Users request action approval via GitHub Issues or Pull Requests
2. **Automated Evaluation**: The system validates the action against security policies
3. **Review Process**: Maintainers review requests and provide approval
4. **Whitelist Update**: Approved actions are added to `whitelist/actions.yml`
5. **Organization Sync**: Changes are automatically applied to organization settings

## Whitelist Management

The system maintains a list of approved actions in the `whitelist/actions.yml` file. You can update this list using two methods:

### 1. Issue Flow (IssueOps)

Create an issue using the "GitHub Actions Whitelist Request" template:

1. **Navigate to Issues** → **New Issue** → **GitHub Actions Whitelist Request**
2. **Fill in the action references** in `owner/repo@version` format
   ```
   docker/build-push-action@v6.17.0
   ```
3. **Provide justification** explaining:
   - What the action does
   - Why it's necessary for your workflow
   - Any security considerations you've reviewed
4. **Confirm security acknowledgments** by checking the required boxes
5. **Submit the issue** - the system will automatically evaluate and process your request

### 2. Git Flow (GitOps)

Submit a pull request that modifies the whitelist directly:

1. **Fork the repository** (or create a branch if you have write access)
2. **Edit `whitelist/actions.yml`** and add your actions:
   ```yaml
   allowedActions:
     - name: owner/repo@version
     - name: docker/build-push-action@v6.17.0  # Example
   ```
3. **Submit a pull request** with a clear description
4. **The system will evaluate** the actions during the PR review process
5. **After approval and merge**, changes are automatically applied

Both methods ensure proper security review and maintain a clear audit trail of approved actions.

### actions.yml Structure

The `whitelist/actions.yml` file uses a simple but strict structure:

```yaml
allowedActions:
  - name: owner/repo@version     # Required: Full action reference in owner/repo@version format
  - name: actions/checkout@v4    # Example: Standard checkout action
  - name: docker/build-push-action@v6.17.0  # Example: Docker build action
```

#### Validation Rules

Each action entry must be properly formatted. The system validates:

- **YAML syntax and structure** - Must be valid YAML
- **Proper indentation** - Spaces required, not tabs (2-space indentation recommended)
- **Required fields presence** - The `name` field is mandatory
- **Array structure** - Must be under the `allowedActions` array
- **Action reference format** - Must follow `owner/repo@ref` pattern

#### Error Handling

If validation fails, you'll receive detailed error messages specifying:
- Whether there's an indentation problem (with guidance about using spaces instead of tabs)
- Which required fields are missing
- Any structural issues in the YAML
- Specific line and position information where available

This helps quickly identify and fix any formatting or structural issues in your whitelist entries.

## Whitelist Application

## Features

- 🔒 **Security-First Approach**: Only approved actions can be used in organization workflows
- 📋 **IssueOps Workflow**: Request action approvals through structured GitHub issues
- 🔄 **GitOps Implementation**: Manage whitelist through version-controlled configuration
- 🤖 **Automated Evaluation**: Built-in security scanning and policy validation
- 📝 **Standardized Process**: Structured templates for consistent request submission  
- 🔔 **Smart Notifications**: Rich, context-aware status updates and feedback
- 🛡️ **Robust Error Handling**: Comprehensive validation and clear error reporting
- 📊 **Audit Trail**: Complete history of approved actions and decisions
- 🎯 **Organization-Wide Control**: Centralized management of allowed GitHub Actions
- ⚡ **Real-Time Application**: Automatic synchronization with GitHub organization settings

## Examples

### Example 1: Basic Workflow Integration

```yaml
name: Manage Actions Whitelist
on:
  push:
    paths: ['whitelist/actions.yml']
    branches: [main]
  pull_request:
    paths: ['whitelist/actions.yml']

jobs:
  validate-whitelist:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Actions
        uses: ./
        with:
          actions: 'actions/checkout@v4,actions/setup-node@v3'
          organization: ${{ github.repository_owner }}
          github-token: ${{ secrets.ACTIONS_SENTINEL_TOKEN }}

  apply-whitelist:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Apply Whitelist
        uses: ./
        with:
          actions: 'actions/checkout@v4,docker/build-push-action@v6.17.0'
          organization: ${{ github.repository_owner }}
          github-token: ${{ secrets.ACTIONS_SENTINEL_TOKEN }}
```

### Example 2: IssueOps Request

When creating an issue for action approval, use this format:

**Action Reference**: `docker/build-push-action@v6.17.0`

**Justification**: 
```
We need this action to build and push Docker images for our microservices deployment pipeline.

Security considerations reviewed:
- Action is from official Docker organization
- Version v6.17.0 is a stable release with known security fixes
- Action will be used in controlled CI/CD environment
- Minimal permissions required (only Docker registry access)
```

### Example 3: GitOps Whitelist Update

```yaml
# whitelist/actions.yml
allowedActions:
  # Core GitHub Actions
  - name: actions/checkout@v4
  - name: actions/setup-node@v4
  - name: actions/setup-python@v5
  
  # Docker Actions  
  - name: docker/login-action@v3
  - name: docker/build-push-action@v6.17.0
  
  # Security Tools
  - name: trufflesecurity/trufflehog@v3.89.2
  - name: oxsecurity/megalinter@v8.7.0
  
  # Deployment Actions
  - name: azure/login@v1
  - name: hashicorp/setup-terraform@v3
```

## Troubleshooting

### Common Issues

#### 1. "Insufficient permissions" Error

**Problem**: Action fails with permissions error
```
Error: Resource not accessible by integration
```

**Solution**: 
- Ensure your GitHub App or PAT has `admin:org` permissions
- Verify the app is installed on the correct organization
- Check that repository secrets are correctly configured

#### 2. YAML Validation Errors

**Problem**: Whitelist validation fails
```
Error: Invalid YAML structure in actions.yml
```

**Solution**:
- Use spaces (not tabs) for indentation
- Ensure proper YAML array syntax:
  ```yaml
  allowedActions:
    - name: action@version  # Correct
  # - name action@version   # Incorrect (missing colon)
  ```
- Validate YAML syntax using online tools

#### 3. Action Reference Format Issues

**Problem**: Action not recognized
```
Error: Invalid action reference format
```

**Solution**: Ensure actions follow the format `owner/repo@ref`:
- ✅ `actions/checkout@v4`
- ✅ `docker/build-push-action@v6.17.0` 
- ❌ `checkout@v4` (missing owner)
- ❌ `actions/checkout` (missing version)

#### 4. GitHub App Installation Issues

**Problem**: App not found or not installed

**Solution**:
1. Verify the app is installed in your organization
2. Check that the App ID in secrets matches your GitHub App
3. Ensure the private key is correctly formatted (including BEGIN/END lines)

### Getting Help

If you continue to experience issues:

1. **Check the Issues tab** for similar problems and solutions
2. **Review workflow logs** for detailed error messages
3. **Validate your configuration** against the examples in this README
4. **Create a new issue** with:
   - Detailed error message
   - Your configuration (with secrets redacted)
   - Steps to reproduce the problem

## Contributing

We welcome contributions to Actions Sentinel! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** or suggest improvements via GitHub Issues
- 📝 **Improve documentation** with clearer examples or explanations  
- 🔧 **Submit bug fixes** or feature enhancements via Pull Requests
- 🧪 **Add tests** to improve code coverage and reliability
- 💡 **Share use cases** and integration examples

### Development Setup

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Make your changes** in a feature branch
4. **Test your changes**:
   ```bash
   npm run build
   npm run test  # Once tests are available
   ```
5. **Submit a pull request** with a clear description of your changes

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new functionality when possible
- Update documentation for any new features
- Use clear, descriptive commit messages
- Ensure your PR passes all status checks

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

### Summary

The Apache 2.0 license allows you to:
- ✅ Use the code commercially
- ✅ Modify and distribute the code
- ✅ Use the code privately
- ✅ Include the code in proprietary software

With the requirement to:
- 📄 Include the original license and copyright notice
- 📝 Document any significant changes made

---

**Questions or need help?** Feel free to [open an issue](../../issues/new) or check our [existing discussions](../../discussions).

## Usage

### As a GitHub Action

You can use this action in your workflows to evaluate and apply GitHub Actions whitelists:

```yaml
name: Apply Actions Whitelist
on:
  push:
    paths:
      - 'whitelist/actions.yml'
    branches:
      - main

jobs:
  apply-whitelist:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      actions: write
      contents: read
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Apply Actions Whitelist
        uses: ./
        with:
          actions: 'actions/checkout@v4,docker/build-push-action@v6.17.0'
          organization: 'your-org-name'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### Input Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `actions` | Yes | Comma-separated list of actions to evaluate | `'actions/checkout@v4,actions/setup-node@v3'` |
| `organization` | Yes | GitHub organization name | `'my-org'` |
| `github-token` | Yes | GitHub token with `admin:org` permissions | `${{ secrets.GITHUB_TOKEN }}` |

#### Output Parameters

| Output | Description |
|--------|-------------|
| `result` | Detailed results of the actions evaluation |
| `status` | Status of the evaluation (`success`/`failure`) |
| `details` | Additional details about the evaluation process |

### Workflow Permissions

When using this action in a GitHub Actions workflow, ensure you set the following permissions:

```yaml
permissions:
  issues: write     # Required for IssueOps functionality
  actions: write    # Required for managing GitHub Actions settings
  contents: read    # Required for checking out code
```

> **⚠️ Important**: The GitHub token provided must have `admin:org` permissions to manage organization settings. The default `GITHUB_TOKEN` may not have sufficient permissions - you might need to use a Personal Access Token (PAT) or GitHub App with the required permissions.

## Configuration

### GitHub App Setup

Using a GitHub App is the recommended approach for authentication as it provides better security and more granular permissions.

#### Step 1: Create a GitHub App

1. **Navigate to your organization's settings**
   - Go to `https://github.com/organizations/YOUR_ORG/settings`
   - Navigate to **Developer settings** → **GitHub Apps**
   - Click **"New GitHub App"**

2. **Fill in the basic information**:
   - **GitHub App name**: `Actions Sentinel` (or your preferred name)
   - **Homepage URL**: Your repository URL (e.g., `https://github.com/your-org/actions-sentinel`)
   - **Webhook**: **Disable** (not required for this use case)

#### Step 2: Set Permissions

Configure the following permissions for your GitHub App:

**Repository Permissions:**
- **Issues**: Read and write
- **Pull requests**: Read and write  
- **Metadata**: Read-only
- **Contents**: Read and write

**Organization Permissions:**
- **Organization administration**: Read and write

#### Step 3: Install the App

1. **Install the app** in your organization after creation
2. **Select repositories** where you want to use Actions Sentinel:
   - **All repositories** (recommended for organization-wide management)
   - **Selected repositories** (for more granular control)

#### Step 4: Generate Authentication

1. **Generate a private key**:
   - After creating the app, navigate to the app's settings
   - Scroll to **Private keys** section
   - Click **"Generate a private key"**
   - **Download and store** the private key securely

2. **Note your App ID**:
   - Find the **App ID** in the app's settings (you'll need this for configuration)

### Repository Secrets

Add the following secrets to your repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `ACTIONS_SENTINEL_APP_ID` | Your GitHub App's ID | `123456` |
| `ACTIONS_SENTINEL_APP_KEY` | The private key content (entire PEM file) | `-----BEGIN RSA PRIVATE KEY-----...` |

#### Alternative: Personal Access Token

If you prefer using a Personal Access Token instead of a GitHub App:

1. **Create a PAT** with the following scopes:
   - `admin:org` - Required for organization settings
   - `repo` - Required for repository access
   - `workflow` - Required for workflow management

2. **Add the token** as a repository secret:
   - Secret name: `GITHUB_TOKEN` or `PAT_TOKEN`
   - Secret value: Your personal access token

### Permission Summary

The configured authentication allows Actions Sentinel to:

- ✅ Read and manage GitHub Actions settings at organization level
- ✅ Create and update issues for action requests (IssueOps)
- ✅ Process pull requests for whitelist changes (GitOps)
- ✅ Read and modify repository contents (whitelist files)
- ✅ Validate and apply organization action policies