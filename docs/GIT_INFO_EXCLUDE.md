# Local Git Exclude Configuration (NOT COMMITTED)

This file provides an example of local-only git exclusions that individual developers
can add to their `.git/info/exclude` file to prevent accidentally committing Dyad
workspace files during development.

## Instructions

To use these exclusions on your local machine, add the following lines to:
`.git/info/exclude`

This file is NOT tracked by git and will only affect your local repository.

## Recommended Local Exclusions

```
# Dyad local workspace
.dyad/
tools/dyad/

# Additional local development files (optional)
dyad-local.config.ts
```

## Why `.git/info/exclude` instead of `.gitignore`?

- `.gitignore` is committed and affects all developers
- `.git/info/exclude` is local-only and won't be committed
- Use this for patterns specific to your local development setup

## Note

The main `.gitignore` already contains comprehensive Dyad-related exclusions.
This file is for additional personal exclusions you may want to add.
