# actions-sentinel

[![Build](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/build.yml/badge.svg)](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/build.yml) [![CodeQL](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/tdupoiron-org/actions-sentinel/actions/workflows/github-code-scanning/codeql)

A security-focused tool for evaluating and managing GitHub Actions in a controlled, automated workflow using IssueOps and GitOps principles.

## Overview

This repository provides a secure way to manage which GitHub Actions are allowed to be used within your organization. It implements a controlled process where actions must be approved before they can be used in workflows, helping to maintain security and prevent potential risks from untrusted actions.

## Whitelist Management

The system maintains a list of approved actions in the `whitelist/actions.yml` file. You can update this list using two methods:

### 1. Issue Flow (IssueOps)

Create an issue using the "GitHub Actions Whitelist Request" template:
1. Fill in the action references (owner/repo@version)
2. Provide justification for the actions
3. Confirm security acknowledgments
4. The system will automatically evaluate and process your request

### 2. Git Flow (GitOps)

Submit a pull request that modifies `actions.yml`:
1. Fork the repository
2. Add your actions to the whitelist following the simple format:
   ```yaml
   allowedActions:
     - name: owner/repo@version
   ```
3. Submit a pull request for review
4. The system will evaluate the actions during the PR review process

Both methods ensure proper security review and maintain a clear audit trail of approved actions.

### actions.yml Structure

The `whitelist/actions.yml` file uses a simple structure:

```yaml
allowedActions:
  - name: owner/repo@version     # Required: Full action reference in owner/repo@version format
```

Each action entry must be properly indented under the `allowedActions` array. The system validates:

- YAML syntax and structure
- Proper indentation (spaces required, not tabs)
- Required fields presence
- Array structure under `allowedActions`

If validation fails, you'll receive a detailed error message specifying:
- Whether there's an indentation problem (including guidance about using spaces instead of tabs)
- Which required fields are missing
- Any structural issues in the YAML
- Specific line and position information where available

This helps quickly identify and fix any formatting or structural issues in your whitelist entries.

## Features

- **IssueOps-based Workflow**: Uses GitHub Issues for requesting action whitelisting
- **Automated Security Evaluation**: Reviews GitHub Actions for security concerns before approval
- **GitOps Implementation**: Maintains whitelist through version-controlled configuration
- **Standardized Request Process**: Structured issue templates for action whitelisting requests
- **CLI Interface**: Programmatic interface to manage action whitelisting
- **Smart Notifications**: Rich, context-aware status updates with dynamic feedback based on evaluation results
- **Robust Error Handling**: Comprehensive error handling and status reporting throughout the process

## Usage

### As a GitHub Action

You can use this action in your workflows to evaluate GitHub Actions:

```yaml
- name: Evaluate Actions
  uses: ./sentinel
  with:
    actions: 'owner/repo@version,another/action@version'  # Comma-separated list of actions
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
