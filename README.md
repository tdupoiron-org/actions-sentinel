# actions-sentinel

A security-focused tool for evaluating and managing GitHub Actions in a controlled, automated workflow using IssueOps and GitOps principles.

## Overview

This repository provides a secure way to manage which GitHub Actions are allowed to be used within your organization. It implements a controlled process where actions must be approved before they can be used in workflows, helping to maintain security and prevent potential risks from untrusted actions.

## Features

- **IssueOps-based Workflow**: Uses GitHub Issues for requesting action whitelisting
- **Automated Security Evaluation**: Reviews GitHub Actions for security concerns before approval
- **GitOps Implementation**: Maintains whitelist through version-controlled configuration
- **Standardized Request Process**: Structured issue templates for action whitelisting requests

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

## Usage

To request a new GitHub Action to be whitelisted:

1. Go to the "Issues" tab
2. Click "New Issue"
3. Select "GitHub Actions Whitelist Request"
4. Fill in the required information:
   - Action reference in the format: `owner/action@version`
   - Detailed justification for the action
   - Confirm security review acknowledgments

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
