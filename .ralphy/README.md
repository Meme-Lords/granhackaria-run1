# Ralphy Configuration for GSD Phase Execution

This directory contains the Ralphy configuration for executing all 6 GSD phases continuously.

## Files

- `config.yaml` - Ralphy configuration with GSD execution rules
- `tasks.yaml` - Task file defining all 6 phases in execution order
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
ralphy --cursor --yaml .ralphy/tasks.yaml --max-iterations 0 --max-retries 3 --verbose
```

Omit `--cursor` if not using Cursor Agent.

## How It Works

1. **GSD Plans First**: All 6 phases have been planned using GSD methodology
2. **Ralphy Executes**: Ralphy reads each phase's PLAN file and executes all tasks
3. **Continuous Execution**: Ralphy runs through all phases sequentially without stopping
4. **Checkpoint Handling**: Ralphy will pause at checkpoints (human-action, human-verify tasks) and wait for your input

## Phase Execution Order

The phases are executed in dependency order:

1. Phase 01: Supabase Setup
2. Phase 02: Wire Frontend
3. Phase 03: Instagram Ingestion
4. Phase 04: Slack Ingestion
5. Phase 05: Scheduling
6. Phase 06: Polish & Deploy

## Checkpoint Tasks

If a phase includes checkpoint tasks (human-action or human-verify), Ralphy will:
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
- Review the phase's PLAN file
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
