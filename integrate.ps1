# StockFlow UI Integration Script
# Integrates Products Table and Dashboard Redesign

Write-Host "StockFlow UI Integration Script" -ForegroundColor Cyan
Write-Host "Integrating Products Table and Dashboard Redesign..." -ForegroundColor Green
Write-Host ""

# Paths
$pageFile = "src\app\page.tsx"
$productsRef = "PRODUCTS-TABLE-REFERENCE.tsx"
$dashboardRef = "DASHBOARD-REFERENCE.tsx"
$backupFile = "src\app\page.tsx.backup"

# Step 1: Create Backup
Write-Host "Step 1: Creating backup..." -ForegroundColor Yellow
Copy-Item $pageFile $backupFile -Force
Write-Host "Backup created successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Read files
Write-Host "Step 2: Reading files..." -ForegroundColor Yellow
$pageContent = Get-Content $pageFile -Raw
$dashboardLines = Get-Content $dashboardRef
$productsLines = Get-Content $productsRef

# Extract code (skip first 5 comment lines)
$dashboardCode = ($dashboardLines | Select-Object -Skip 5) -join "`r`n"
$productsCode = ($productsLines | Select-Object -Skip 5) -join "`r`n"

Write-Host "Files read successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Integrate Dashboard
Write-Host "Step 3: Integrating Dashboard..." -ForegroundColor Yellow

$dashboardStart = $pageContent.IndexOf('{/* Dashboard View */')
$productsStart = $pageContent.IndexOf('{/* Products View */')

if ($dashboardStart -ge 0 -and $productsStart -gt $dashboardStart) {
    $beforeDashboard = $pageContent.Substring(0, $dashboardStart)
    $afterDashboard = $pageContent.Substring($productsStart)
    
    $pageContent = $beforeDashboard + $dashboardCode + "`r`n`r`n        " + $afterDashboard
    Write-Host "Dashboard integrated" -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not locate Dashboard section" -ForegroundColor Red
    Copy-Item $backupFile $pageFile -Force
    Exit 1
}
Write-Host ""

# Step 4: Integrate Products
Write-Host "Step 4: Integrating Products table..." -ForegroundColor Yellow

$productsStart = $pageContent.IndexOf('{/* Products View */')
$categoriesStart = $pageContent.IndexOf('{/* Categories View */')

if ($productsStart -ge 0 -and $categoriesStart -gt $productsStart) {
    $beforeProducts = $pageContent.Substring(0, $productsStart)
    $afterProducts = $pageContent.Substring($categoriesStart)
    
    $pageContent = $beforeProducts + $productsCode + "`r`n`r`n        " + $afterProducts
    Write-Host "Products integrated" -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not locate Products section" -ForegroundColor Red
    Copy-Item $backupFile $pageFile -Force
    Exit 1
}
Write-Host ""

# Step 5: Save
Write-Host "Step 5: Saving integrated file..." -ForegroundColor Yellow
$pageContent | Set-Content $pageFile -NoNewline
Write-Host "File saved" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "Step 6: Verification..." -ForegroundColor Yellow
$newContent = Get-Content $pageFile -Raw

if ($newContent -match "products-table-container" -and $newContent -match "dashboard-grid") {
    Write-Host "INTEGRATION COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. npm run build" -ForegroundColor White
    Write-Host "2. If successful:" -ForegroundColor White
    Write-Host "   git add src/app/page.tsx" -ForegroundColor White
  Write-Host "   git commit -m feat: Integrate Products and Dashboard redesign" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Backup saved at: src\app\page.tsx.backup" -ForegroundColor Cyan
} else {
    Write-Host "WARNING: Integration may need review" -ForegroundColor Yellow
    Write-Host "Backup available at: src\app\page.tsx.backup" -ForegroundColor Cyan
}
