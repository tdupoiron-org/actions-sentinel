# GitHub Actions Sentinel Action

This action validates GitHub Actions against an organization's whitelist and security policies.

## Inputs

- `action-name`: The action reference to validate (format: owner/repo@ref)
- `github-token`: GitHub token with organization admin permissions
- `organization`: GitHub organization name

## Usage

```yaml
- uses: my-org/actions-sentinel@main
  with:
    action-name: 'actions/checkout@v4'
    github-token: ${{ secrets.GITHUB_TOKEN }}
    organization: 'my-org'
```
