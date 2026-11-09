param([switch]$CheckOnly)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

function Find-NodeExecutable {
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($nodeCommand) { return $nodeCommand.Source }
    $nodeCandidates = @(
        (Join-Path $PSScriptRoot 'node.exe'),
        (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
        (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
        (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe')
    )
    foreach ($nodeCandidate in $nodeCandidates) {
        if (Test-Path -LiteralPath $nodeCandidate -PathType Leaf) { return $nodeCandidate }
    }
    return $null
}

function Get-RegisteredVaults {
    $registryFile = Join-Path $env:APPDATA 'obsidian\obsidian.json'
    if (Test-Path -LiteralPath $registryFile) {
        $registry = Get-Content -LiteralPath $registryFile -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($entry in $registry.vaults.PSObject.Properties.Value) {
            if ($entry.path -and (Test-Path -LiteralPath $entry.path -PathType Container)) { $entry.path }
        }
    }
}

$nodeExecutable = Find-NodeExecutable
$importerPath = Join-Path $PSScriptRoot 'import-hotkeys.mjs'
$profilePath = Join-Path $PSScriptRoot 'typora-hotkeys.json'
if ($CheckOnly) {
    if (-not $nodeExecutable) { throw 'Node.js was not found.' }
    if (-not (Test-Path -LiteralPath $importerPath)) { throw 'Importer was not found.' }
    $null = Get-Content -LiteralPath $profilePath -Raw -Encoding UTF8 | ConvertFrom-Json
    [pscustomobject]@{ Node = $nodeExecutable; Importer = $importerPath; Vaults = @(Get-RegisteredVaults) } | ConvertTo-Json
    exit 0
}

if (-not $nodeExecutable) {
    [System.Windows.Forms.MessageBox]::Show('未找到 Node.js。请先安装 Node.js LTS，或将 node.exe 放入本工具文件夹，然后重新双击 Start.cmd。无需安装 npm 依赖。', '需要 Node.js') | Out-Null
    exit 1
}

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Typora 风格快捷键 · Obsidian'
$form.ClientSize = New-Object System.Drawing.Size(760, 520)
$form.StartPosition = 'CenterScreen'
$form.MinimumSize = $form.Size

$intro = New-Object System.Windows.Forms.Label
$intro.Text = '选择笔记库，点击“导入快捷键”。写入前自动备份，请先完全退出 Obsidian。'
$intro.SetBounds(16, 16, 725, 25)
$form.Controls.Add($intro)

$vaultBox = New-Object System.Windows.Forms.ComboBox
$vaultBox.SetBounds(16, 50, 620, 28)
$vaultBox.Anchor = 'Top, Left, Right'
$vaultBox.DropDownStyle = 'DropDown'
try {
    foreach ($registeredVault in @(Get-RegisteredVaults)) { $vaultBox.Items.Add($registeredVault) | Out-Null }
} catch {
    $intro.Text = '无法自动读取笔记库列表，请点击“选择文件夹”手动选择。'
}
if ($vaultBox.Items.Count -gt 0) { $vaultBox.SelectedIndex = 0 }
$form.Controls.Add($vaultBox)

$browseButton = New-Object System.Windows.Forms.Button
$browseButton.Text = '选择文件夹'
$browseButton.SetBounds(646, 48, 98, 30)
$browseButton.Anchor = 'Top, Right'
$browseButton.Add_Click({
    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = '选择 Obsidian 笔记库根目录（包含 .obsidian 的文件夹）'
    if ($dialog.ShowDialog() -eq 'OK') { $vaultBox.Text = $dialog.SelectedPath }
    $dialog.Dispose()
})
$form.Controls.Add($browseButton)

$configLabel = New-Object System.Windows.Forms.Label
$configLabel.Text = '配置目录：'
$configLabel.SetBounds(16, 91, 85, 24)
$form.Controls.Add($configLabel)
$configBox = New-Object System.Windows.Forms.TextBox
$configBox.Text = '.obsidian'
$configBox.SetBounds(104, 88, 200, 26)
$form.Controls.Add($configBox)

$conflictBox = New-Object System.Windows.Forms.CheckBox
$conflictBox.Text = '让 Typora 键位优先（移除其他命令的冲突绑定）'
$conflictBox.SetBounds(320, 88, 425, 26)
$form.Controls.Add($conflictBox)

$output = New-Object System.Windows.Forms.TextBox
$output.Multiline = $true
$output.ReadOnly = $true
$output.ScrollBars = 'Both'
$output.WordWrap = $false
$output.SetBounds(16, 170, 728, 330)
$output.Anchor = 'Top, Bottom, Left, Right'
$output.Text = "导入：应用 Typora 常用快捷键，并保留无关的自定义键位。`r`n预览：只查看改动，不写文件。恢复：选择之前的 hotkeys.json.backup-* 备份。`r`n`r`n多设备：复制整个工具文件夹，或同步笔记库的 .obsidian/hotkeys.json。"
$form.Controls.Add($output)

function Invoke-HotkeyTool([bool]$Apply, [string]$RestoreFile) {
    try {
        $vaultPath = $vaultBox.Text.Trim().Trim('"')
        if (-not (Test-Path -LiteralPath $vaultPath -PathType Container)) { throw '请选择有效的笔记库文件夹。' }
        if ($Apply -and (Get-Process -Name Obsidian -ErrorAction SilentlyContinue)) {
            throw '请先完全退出 Obsidian，再点击导入或恢复，避免运行中的应用覆盖快捷键文件。'
        }
        $toolArguments = @($importerPath, '--vault', $vaultPath, '--config-dir', $configBox.Text.Trim())
        if ($Apply) { $toolArguments += '--apply' }
        if ($conflictBox.Checked) { $toolArguments += '--resolve-conflicts' }
        if ($RestoreFile) { $toolArguments += @('--restore', $RestoreFile) }
        $previousEncoding = [Console]::OutputEncoding
        $previousErrorPreference = $ErrorActionPreference
        try {
            [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
            $ErrorActionPreference = 'Continue'
            $toolOutput = & $nodeExecutable @toolArguments 2>&1
            $toolExit = $LASTEXITCODE
        } finally {
            [Console]::OutputEncoding = $previousEncoding
            $ErrorActionPreference = $previousErrorPreference
        }
        $output.Text = ($toolOutput | ForEach-Object { $_.ToString() }) -join "`r`n"
        if ($toolExit -ne 0) { throw '操作未完成。请查看结果中的路径或冲突；如需让 Typora 键位优先，请先预览再勾选冲突选项。' }
        if ($Apply) {
            [System.Windows.Forms.MessageBox]::Show('已完成。已有配置的改动已自动备份，备份路径显示在结果中。现在可以重新打开 Obsidian。', '完成') | Out-Null
        }
    } catch {
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, '快捷键工具') | Out-Null
    }
}

$previewButton = New-Object System.Windows.Forms.Button
$previewButton.Text = '预览改动'
$previewButton.SetBounds(16, 128, 120, 30)
$previewButton.Add_Click({ Invoke-HotkeyTool -Apply $false -RestoreFile '' })
$form.Controls.Add($previewButton)
$applyButton = New-Object System.Windows.Forms.Button
$applyButton.Text = '导入快捷键'
$applyButton.SetBounds(148, 128, 140, 30)
$applyButton.Add_Click({ Invoke-HotkeyTool -Apply $true -RestoreFile '' })
$form.Controls.Add($applyButton)
$restoreButton = New-Object System.Windows.Forms.Button
$restoreButton.Text = '恢复备份'
$restoreButton.SetBounds(300, 128, 120, 30)
$restoreButton.Add_Click({
    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = '选择当前笔记库配置目录中的快捷键备份'
    $dialog.Filter = 'Hotkey backup|hotkeys.json.backup-*|All files|*.*'
    $candidateDirectory = Join-Path $vaultBox.Text $configBox.Text
    if (Test-Path -LiteralPath $candidateDirectory -PathType Container) { $dialog.InitialDirectory = $candidateDirectory }
    if ($dialog.ShowDialog() -eq 'OK') { Invoke-HotkeyTool -Apply $true -RestoreFile $dialog.FileName }
    $dialog.Dispose()
})
$form.Controls.Add($restoreButton)

[System.Windows.Forms.Application]::Run($form)
$form.Dispose()
