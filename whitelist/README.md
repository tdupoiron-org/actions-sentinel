# Actions Whitelist

This directory contains the organization's GitHub Actions whitelist configuration.

## Structure

- `actions.yml`: The whitelist of approved actions
- `schema.json`: JSON Schema defining the whitelist format

## Whitelist Format

Actions are defined in `actions.yml` with the following format:

```yaml
allowedActions:
  - name: actions/checkout@v4
    added: "2024-01-15"
    approvedBy: "username"
    securityReview: "completed"
```
