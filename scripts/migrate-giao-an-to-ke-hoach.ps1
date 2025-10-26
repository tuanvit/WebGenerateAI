# PowerShell script to migrate "giáo án" to "kế hoạch bài dạy"
# Run this script from the project root directory

Write-Host "Starting migration: giáo án -> kế hoạch bài dạy" -ForegroundColor Green

# Define replacement patterns
$replacements = @(
    @{Old = 'giáo án'; New = 'kế hoạch bài dạy'},
    @{Old = 'Giáo án'; New = 'Kế hoạch bài dạy'},
    @{Old = 'GIÁO ÁN'; New = 'KẾ HOẠCH BÀI DẠY'},
    @{Old = 'soạn giáo án'; New = 'soạn kế hoạch bài dạy'},
    @{Old = 'Soạn giáo án'; New = 'Soạn kế hoạch bài dạy'},
    @{Old = 'tạo giáo án'; New = 'tạo kế hoạch bài dạy'},
    @{Old = 'Tạo giáo án'; New = 'Tạo kế hoạch bài dạy'},
    @{Old = 'Tạo Giáo Án'; New = 'Tạo Kế Hoạch Bài Dạy'},
    @{Old = 'Prompt Giáo Án'; New = 'Prompt Kế Hoạch Bài Dạy'},
    @{Old = 'Thông tin giáo án'; New = 'Thông tin kế hoạch bài dạy'},
    @{Old = 'Chủ đề giáo án'; New = 'Chủ đề kế hoạch bài dạy'},
    @{Old = 'Định dạng giáo án'; New = 'Định dạng kế hoạch bài dạy'},
    @{Old = 'CẤU TRÚC GIÁO ÁN'; New = 'CẤU TRÚC KẾ HOẠCH BÀI DẠY'},
    @{Old = 'mẫu giáo án'; New = 'mẫu kế hoạch bài dạy'},
    @{Old = 'Template soạn giáo án'; New = 'Template soạn kế hoạch bài dạy'},
    @{Old = 'Template tạo giáo án'; New = 'Template tạo kế hoạch bài dạy'}
)

# Define file patterns to process
$filePatterns = @(
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
)

# Counter for tracking changes
$filesChanged = 0
$totalReplacements = 0

# Process each file pattern
foreach ($pattern in $filePatterns) {
    $files = Get-ChildItem -Path $pattern -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileReplacements = 0
        
        # Apply all replacements
        foreach ($replacement in $replacements) {
            $oldValue = $replacement.Old
            $newValue = $replacement.New
            
            if ($content -match [regex]::Escape($oldValue)) {
                $content = $content -replace [regex]::Escape($oldValue), $newValue
                $fileReplacements++
            }
        }
        
        # Save if content changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $filesChanged++
            $totalReplacements += $fileReplacements
            Write-Host "Updated: $($file.FullName) ($fileReplacements replacements)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nMigration completed!" -ForegroundColor Green
Write-Host "Files changed: $filesChanged" -ForegroundColor Cyan
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run database migration: npm run prisma:migrate" -ForegroundColor White
Write-Host "2. Update seed data: npm run seed" -ForegroundColor White
Write-Host "3. Test the application: npm run dev" -ForegroundColor White
