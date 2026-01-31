# Ralphy Configuration for GSD Phase Execution

This directory contains the Ralphy configuration for executing all 20 GSD phases continuously.

## Files

- `config.yaml` - Ralphy configuration with GSD execution rules
- `tasks.yaml` - Task file defining all 20 phases in execution order
- `progress.txt` - Ralphy progress tracking (auto-generated)
- `README.md` - This file

## Running All Phases

### Option 1: Using the Script (Recommended)

**Windows (PowerShell):**
```powershell
.\run-ralphy-all-phases.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x run-ralphy-all-phases.sh
./run-ralphy-all-phases.sh
```

### Option 2: Direct Command

```bash
ralphy --yaml .ralphy/tasks.yaml --max-iterations 0 --max-retries 3 --verbose
```

## How It Works

1. **GSD Plans First**: All 20 phases have been planned using GSD methodology
2. **Ralphy Executes**: Ralphy reads each phase's PLAN.md file and executes all tasks
3. **Continuous Execution**: Ralphy runs through all phases sequentially without stopping
4. **Checkpoint Handling**: Ralphy will pause at checkpoints (human-action, human-verify tasks) and wait for your input

## Phase Execution Order

The phases are executed in dependency order:

1. Phase 01: Project Setup & Foundation
2. Phase 02: Core UI Components & Layout
3. Phases 03-12: Content Sections (can run in parallel waves where dependencies allow)
4. Phase 13: SEO Structured Data
5. Phase 14: SEO Local
6. Phase 15: SEO Technical
7. Phase 16: Performance Optimization
8. Phase 17: Accessibility & Testing
9. Phase 18: Content & Copywriting
10. Phase 19: Pre-Launch Setup
11. Phase 20: Launch & Verification

## Checkpoint Tasks

Some phases have checkpoint tasks that require human interaction:

- **Phase 17**: Screen reader testing, cross-browser testing, mobile device testing
- **Phase 18**: Content gathering from user (personal info, pricing, testimonials)
- **Phase 19**: External account setup (Calendly, Stripe, Google Business Profile)
- **Phase 20**: Production deployment and live testing

When Ralphy hits a checkpoint, it will:
1. Pause execution
2. Display what needs to be done
3. Wait for your confirmation/input
4. Continue after verification

## Monitoring Progress

- Check `.ralphy/progress.txt` for Ralphy's progress tracking
- Check `.planning/STATE.md` for GSD project state updates
- Check phase directories for `XX-SUMMARY.md` files after each phase completes
- Check git commits for atomic task commits

## Stopping and Resuming

If you need to stop Ralphy:
- Press `Ctrl+C` to stop gracefully
- Ralphy will save progress
- Resume by running the same command again (Ralphy will continue from where it stopped)

## Configuration

The `config.yaml` includes rules that ensure:
- GSD execution patterns are followed
- Atomic commits per task
- SUMMARY.md files are created after each phase
- STATE.md is updated after each phase
- Checkpoints are handled correctly

## Troubleshooting

**If Ralphy stops unexpectedly:**
- Check the error message
- Review the phase's PLAN.md file
- Check `.planning/STATE.md` for current status
- Resume execution with the same command

**If a phase fails:**
- Ralphy will retry up to 3 times (configured with `--max-retries 3`)
- Check the phase's SUMMARY.md for details
- Review git commits to see what was completed
- Fix issues manually if needed, then continue

**If stuck at a checkpoint:**
- Complete the required action
- Verify the action worked
- Confirm to Ralphy to continue
