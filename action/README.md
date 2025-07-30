# GitHub Actions Sentinel Action

This action validates GitHub Actions against an organization's whitelist and security policies.

## Inputs

- `actions`: Comma-separated list of actions to evaluate (format: owner/repo@ref)
- `github-token`: GitHub token with organization admin permissions
- `organization`: GitHub organization name

## Outputs

- `result`: Detailed results of the actions evaluation
- `status`: Status of the evaluation (success/failure)
- `details`: Additional details about the evaluation process

## Usage

```yaml
- uses: tdupoiron-org/actions-sentinel@main
  with:
    actions: 'actions/checkout@v4,actions/setup-node@v3'
    github-token: ${{ secrets.GITHUB_TOKEN }}
    organization: 'my-org'
```

## Requirements

- The GitHub token must have `admin:org` permissions to manage organization settings
- The default `GITHUB_TOKEN` may not have sufficient permissions - you might need to use a Personal Access Token (PAT) with the required permissions
