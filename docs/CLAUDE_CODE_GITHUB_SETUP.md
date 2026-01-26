# How to Set Up Claude Code with GitHub Actions

A complete guide to integrating Claude Code with GitHub for automated tasks, scheduled jobs, and AI-powered development workflows.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Claude Code OAuth Token](#setting-up-claude-code-oauth-token)
3. [Basic Claude Code Workflow](#basic-claude-code-workflow)
4. [Scheduled/Cron Workflows](#scheduledcron-workflows)
5. [Common Patterns](#common-patterns)
6. [Configuration Reference](#configuration-reference)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A GitHub repository
- [Claude Code CLI](https://claude.ai/code) installed locally
- A Claude Pro/Max subscription (for OAuth token)

---

## Setting Up Claude Code OAuth Token

### Step 1: Install the GitHub App

Run this command in your terminal with Claude Code:

```bash
/install-github-app
```

This will:
- Guide you through installing the Claude GitHub App
- Automatically set up the `CLAUDE_CODE_OAUTH_TOKEN` secret in your repo
- Create initial workflow files

### Step 2: Verify the Secret

Check that the secret was created:

```bash
gh secret list --repo YOUR_USERNAME/YOUR_REPO
```

You should see:
```
CLAUDE_CODE_OAUTH_TOKEN    2026-01-22T19:16:35Z
```

### Alternative: Manual Token Setup

If `/install-github-app` doesn't work, you can set up manually:

1. Generate a token:
   ```bash
   claude setup-token
   ```

2. Add it to your repo:
   ```bash
   gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo YOUR_USERNAME/YOUR_REPO
   ```
   Then paste the token when prompted.

---

## Basic Claude Code Workflow

Create `.github/workflows/claude.yml`:

```yaml
name: Claude Code

on:
  # Trigger when someone comments @claude on issues/PRs
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

  # Trigger when issues are opened with @claude in title/body
  issues:
    types: [opened, assigned]

jobs:
  claude:
    # Only run if @claude is mentioned
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))

    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

### Testing It

1. Create an issue titled: `@claude What does this repo do?`
2. Claude will analyze your repo and respond in the issue comments

---

## Scheduled/Cron Workflows

### Daily Summary Example

Create `.github/workflows/daily-summary.yml`:

```yaml
name: Daily Summary

on:
  # Run every day at 9am UTC
  schedule:
    - cron: '0 9 * * *'

  # Allow manual trigger for testing
  workflow_dispatch:

jobs:
  daily-summary:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      pull-requests: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for git log

      - name: Run Claude Daily Summary
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}

          prompt: |
            Create a daily summary for this repository:

            1. Check git log for commits in the last 24 hours
            2. List any open issues
            3. List any open PRs needing review

            Create a GitHub issue titled "Daily Summary - [TODAY'S DATE]"
            using the gh CLI.

          # Only allow specific commands for security
          claude_args: '--allowedTools Bash(git:*),Bash(gh issue:*),Bash(gh pr:*)'
```

### Weekly Code Review Example

```yaml
name: Weekly Code Review

on:
  schedule:
    - cron: '0 10 * * 5'  # Every Friday at 10am UTC
  workflow_dispatch:

jobs:
  code-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      id-token: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}

          prompt: |
            Perform a weekly code review:

            1. Analyze recent changes (git log --since="7 days ago")
            2. Look for potential bugs or issues
            3. Check for security concerns
            4. Suggest improvements

            Create an issue titled "Weekly Code Review - [DATE]" with findings.

          claude_args: '--allowedTools Bash(git:*),Bash(gh issue:*),Read,Glob,Grep'
```

### Stale Issue Checker Example

```yaml
name: Stale Issue Checker

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8am UTC
  workflow_dispatch:

jobs:
  check-stale:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Check Stale Issues
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}

          prompt: |
            Check for stale issues in this repository:

            1. Use `gh issue list` to get all open issues
            2. Identify issues with no activity in 30+ days
            3. Add a comment asking if the issue is still relevant

            Be polite and helpful in comments.

          claude_args: '--allowedTools Bash(gh issue:*)'
```

---

## Common Patterns

### Pattern 1: Feature Implementation from Issues

When users create issues starting with `@claude`, Claude implements the feature:

```yaml
on:
  issues:
    types: [opened]

jobs:
  implement:
    if: contains(github.event.issue.title, '@claude')
    # ... Claude implements and creates a PR
```

### Pattern 2: Automatic PR Review

Review all PRs automatically when opened:

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    # ... Claude reviews the code
```

### Pattern 3: Scheduled Maintenance

Run maintenance tasks on a schedule:

```yaml
on:
  schedule:
    - cron: '0 3 * * *'  # 3am daily

jobs:
  maintenance:
    # ... Claude checks for issues, updates deps, etc.
```

---

## Configuration Reference

### Cron Syntax

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

**Common Schedules**:

| Schedule | Cron Expression |
|----------|----------------|
| Every hour | `0 * * * *` |
| Every 6 hours | `0 */6 * * *` |
| Daily at midnight | `0 0 * * *` |
| Daily at 9am | `0 9 * * *` |
| Weekly (Monday 9am) | `0 9 * * 1` |
| Monthly (1st at 9am) | `0 9 1 * *` |

**Note**: GitHub Actions cron uses UTC timezone.

### Claude Code Action Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `claude_code_oauth_token` | Yes | Your Claude OAuth token |
| `prompt` | No | Custom instructions for Claude |
| `claude_args` | No | CLI arguments (e.g., `--allowedTools`) |
| `settings` | No | JSON settings including env vars |

### Allowed Tools (Security)

Restrict what Claude can do with `claude_args`:

```yaml
# Only git and gh commands
claude_args: '--allowedTools Bash(git:*),Bash(gh:*)'

# Only read operations
claude_args: '--allowedTools Read,Glob,Grep'

# npm and node for testing
claude_args: '--allowedTools Bash(npm:*),Bash(node:*)'

# Multiple tools
claude_args: '--allowedTools Bash(git:*),Bash(gh issue:*),Bash(gh pr:*),Read,Glob'
```

### Passing Secrets/Environment Variables

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
    settings: |
      {
        "env": {
          "MY_API_KEY": "${{ secrets.MY_API_KEY }}",
          "DATABASE_URL": "${{ secrets.DATABASE_URL }}"
        }
      }
```

### Permissions Reference

```yaml
permissions:
  contents: read        # Read repo files
  contents: write       # Push commits
  issues: read          # Read issues
  issues: write         # Create/comment on issues
  pull-requests: read   # Read PRs
  pull-requests: write  # Create/comment on PRs
  id-token: write       # Required for Claude OAuth
  actions: read         # Read workflow runs
```

---

## Troubleshooting

### "Resource not accessible by integration"

**Problem**: Workflow can't comment on issues/PRs.

**Solution**: Add write permissions:
```yaml
permissions:
  issues: write
  pull-requests: write
```

### Claude Can't Run Commands

**Problem**: Claude says it doesn't have permission to run bash commands.

**Solution**: Add `--allowedTools` to `claude_args`:
```yaml
claude_args: '--allowedTools Bash(npm:*),Bash(node:*)'
```

### Scheduled Workflow Not Running

**Problem**: Cron job doesn't trigger.

**Solutions**:
1. GitHub disables scheduled workflows after 60 days of repo inactivity
2. Check the Actions tab for any errors
3. Manually trigger with `workflow_dispatch` to test:
   ```bash
   gh workflow run "Your Workflow Name"
   ```

### Token Issues

**Problem**: Authentication errors.

**Solutions**:
1. Re-run `/install-github-app` in Claude Code
2. Or manually refresh:
   ```bash
   claude setup-token
   gh secret set CLAUDE_CODE_OAUTH_TOKEN
   ```

---

## Quick Start Checklist

- [ ] Install Claude Code CLI
- [ ] Run `/install-github-app` in your repo
- [ ] Verify `CLAUDE_CODE_OAUTH_TOKEN` secret exists
- [ ] Create `.github/workflows/claude.yml`
- [ ] Test with an issue: `@claude hello!`
- [ ] (Optional) Add scheduled workflows
- [ ] (Optional) Add additional secrets for your use case

---

## Resources

- [Claude Code Documentation](https://claude.ai/code/docs)
- [claude-code-action GitHub](https://github.com/anthropics/claude-code-action)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
