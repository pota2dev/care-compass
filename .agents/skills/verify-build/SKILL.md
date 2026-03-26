---
name: verify-build
description: Automatically verifies the Next.js build and reports errors.
---

# Verify Build Skill

This skill allows agents to automatically verify that the application builds successfully.

## Usage
If the user asks to verify the build, run the `npm run build` command and capture the output. Check if there are any TS errors or Next.js build failures.

## Steps

1. Run `npm run build` in the project root.
2. If there are errors, read the terminal output to understand what failed.
3. Fix the errors sequentially.
4. If the build succeeds, inform the user.
