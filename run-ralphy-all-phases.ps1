# PowerShell script to run Ralphy through all 20 GSD phases continuously
# This will execute all phases sequentially without stopping (except at checkpoints)

Write-Host "Starting Ralphy execution of all 20 GSD phases..." -ForegroundColor Green
Write-Host "This will run continuously through all phases." -ForegroundColor Yellow
Write-Host "Ralphy will pause at checkpoints (human-action, human-verify tasks) for your input." -ForegroundColor Yellow
Write-Host ""

# Run Ralphy with the tasks YAML file
# --max-iterations 0 = unlimited (run all tasks)
# --yaml = use the tasks.yaml file
# --max-retries 3 = retry failed tasks up to 3 times
ralphy --yaml .ralphy/tasks.yaml --max-iterations 0 --max-retries 3 --verbose

Write-Host ""
Write-Host "Ralphy execution complete!" -ForegroundColor Green
