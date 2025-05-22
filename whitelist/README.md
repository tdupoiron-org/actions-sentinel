# Actions Whitelist

This directory contains the organization's GitHub Actions whitelist configuration.

## Structure

- `actions.yml`: The whitelist of approved actions
- `schema.json`: JSON Schema defining the whitelist format

## Whitelist Format

Actions are defined in `actions.yml` using a simple format that only requires the action name:

```yaml
allowedActions:
  - name: actions/checkout@v4
```

Each entry must be in the format `owner/repo@ref` where:
- `owner`: Repository owner (can include letters, numbers, hyphens, and underscores)
- `repo`: Repository name (can include letters, numbers, hyphens, and underscores)
- `ref`: Version reference (can include letters, numbers, dots, hyphens, and underscores)
