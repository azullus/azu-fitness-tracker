# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## FITNESS-TRACKER

Personal fitness management PWA for any size household.

## Project Overview

- **Stack**: Next.js 15, TypeScript, Tailwind CSS, Supabase
- **Type**: Progressive Web App (PWA)
- **Purpose**: Fitness tracking, meal planning, workout logging

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
```

## Data Scripts

```bash
npm run sync:import       # Import CSV data
npm run sync:export       # Export CSV data
npm run import:recipes    # Import recipes
npm run extract:recipes   # Extract recipes to JSON
```

## Coding Conventions

- TypeScript strict mode
- Next.js 15 App Router
- Tailwind CSS for styling
- Supabase for backend
- Jest + Playwright for testing

## Key Directories

- `app/` - Next.js app router pages
- `components/` - React components
- `lib/` - Utilities and Supabase client
- `types/` - TypeScript type definitions
- `scripts/` - Data import/export utilities

## Before Committing

1. Run `npm run lint` to check for issues
2. Run `npm test` to run unit tests
3. Ensure `npm run build` succeeds

## Multi-Agent Worktree Protocol

This project supports parallel development using Git worktrees. When multiple Claude agents work simultaneously:

### Worktree Structure
```
AI-Projects/
├── FITNESS-TRACKER/              ← Main worktree (main branch)
└── FITNESS-TRACKER-worktrees/    ← Feature worktrees
    ├── feature-meals/            ← Agent 1 workspace
    ├── feature-workouts/         ← Agent 2 workspace
    └── bugfix-sync/              ← Agent 3 workspace
```

### Agent Rules
1. **Check assignment** - Confirm which worktree/branch you're assigned to
2. **Stay in your lane** - Only modify files in YOUR worktree
3. **Branch naming** - Use `feature/`, `bugfix/`, or `refactor/` prefixes
4. **Commit frequently** - Small, atomic commits with clear messages
5. **Push before ending** - Always push to remote before session ends
6. **Never touch main** - Only merge via PR after review

### Setup Commands
```bash
# Create worktrees directory
mkdir -p ../FITNESS-TRACKER-worktrees

# Create feature worktrees
git worktree add ../FITNESS-TRACKER-worktrees/feature-meals -b feature/meals
git worktree add ../FITNESS-TRACKER-worktrees/feature-workouts -b feature/workouts
git worktree add ../FITNESS-TRACKER-worktrees/bugfix-sync -b bugfix/data-sync

# List active worktrees
git worktree list

# Remove worktree when done
git worktree remove ../FITNESS-TRACKER-worktrees/feature-meals
```

### Merge Workflow
1. Push feature branch to remote
2. Create PR on GitHub
3. Review and merge to main
4. Delete feature branch and worktree
