$ErrorActionPreference = "Stop"
$PAW = "$env:USERPROFILE\.meituan-catpaw\bin\paw.cmd"

function Invoke-BrowserAction {
    param([string]$Json)
    $process = Start-Process -FilePath $PAW -ArgumentList "browser-action", $Json -NoNewWindow -PassThru -Wait -RedirectStandardOutput ".\.screenshot_out.json" -RedirectStandardError ".\.screenshot_err.log"
    $output = Get-Content ".\.screenshot_out.json" -Raw
    return $output | ConvertFrom-Json
}

Write-Host "Navigating to http://localhost:3000..."
$navResult = Invoke-BrowserAction -Json '{"action":"navigate","url":"http://localhost:3000"}'
Write-Host "Title: $($navResult.data.title)"

Start-Sleep -Seconds 2

Write-Host "Taking viewport screenshot..."
$shotResult = Invoke-BrowserAction -Json '{"action":"screenshot","fullPage":false}'
Write-Host "Screenshot saved to: $($shotResult.data.path)"
Write-Host "Done!"
