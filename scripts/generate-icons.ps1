<#
.SYNOPSIS
  Regenerates extension/icons/icon{16,32,48,128}.png.

.DESCRIPTION
  Draws a dark rounded tile with a play triangle and a struck-through
  progress bar using System.Drawing (Windows PowerShell 5.1+).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
#>
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\extension\icons"
New-Item -ItemType Directory -Force $outDir | Out-Null

function New-Brush([int]$r, [int]$g, [int]$b) {
  New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, $r, $g, $b))
}

foreach ($size in 16, 32, 48, 128) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.Clear([System.Drawing.Color]::Transparent)

  # Rounded tile
  $d = [single]($size * 0.44); $w = [single]($size - 1)
  $tile = New-Object System.Drawing.Drawing2D.GraphicsPath
  $tile.AddArc(0, 0, $d, $d, 180, 90)
  $tile.AddArc($w - $d, 0, $d, $d, 270, 90)
  $tile.AddArc($w - $d, $w - $d, $d, $d, 0, 90)
  $tile.AddArc(0, $w - $d, $d, $d, 90, 90)
  $tile.CloseFigure()
  $g.FillPath((New-Brush 28 28 30), $tile)

  # Play triangle
  $play = @(
    (New-Object System.Drawing.PointF ([single]($size * 0.38)), ([single]($size * 0.22))),
    (New-Object System.Drawing.PointF ([single]($size * 0.38)), ([single]($size * 0.56))),
    (New-Object System.Drawing.PointF ([single]($size * 0.66)), ([single]($size * 0.39)))
  )
  $g.FillPolygon((New-Brush 240 240 240), $play)

  # Progress bar: grey track, red played part
  $barH = [single][Math]::Max(2, $size * 0.09)
  $barX = [single]($size * 0.16); $barY = [single]($size * 0.72); $barW = [single]($size * 0.68)
  $g.FillRectangle((New-Brush 90 90 95), $barX, $barY, $barW, $barH)
  $g.FillRectangle((New-Brush 230 40 40), $barX, $barY, [single]($barW * 0.55), $barH)

  # Strike-through
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 240, 240, 240)), ([single][Math]::Max(1.5, $size * 0.08))
  $pen.StartCap = "Round"; $pen.EndCap = "Round"
  $g.DrawLine($pen, [single]($size * 0.30), [single]($size * 0.88), [single]($size * 0.70), [single]($size * 0.60))

  $g.Dispose()
  $bmp.Save((Join-Path $outDir "icon$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Write-Host "Icons written to $outDir"
