Add-Type -AssemblyName System.Drawing

$mediaDir = "D:\jose\Lubricentro_Estrada\frontend\public\media"
$files = Get-ChildItem -Path $mediaDir -Filter "*.jpg"

foreach ($file in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
    $w = $bmp.Width
    $h = $bmp.Height
    
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $g.Dispose()

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $bmpData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bytes = [Math]::Abs($bmpData.Stride) * $h
    $rgbValues = New-Object byte[] $bytes
    [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $rgbValues, 0, $bytes)

    for ($i = 0; $i -lt $bytes; $i += 4) {
        $b = $rgbValues[$i]
        $gVal = $rgbValues[$i+1]
        $r = $rgbValues[$i+2]
        
        # If pixel is near white
        if ($r -gt 240 -and $gVal -gt 240 -and $b -gt 240) {
            $minVal = [Math]::Min([int]$r, [Math]::Min([int]$gVal, [int]$b))
            if ($minVal -ge 252) {
                $rgbValues[$i+3] = 0
            } else {
                $alpha = [int]((252 - $minVal) * 21.25)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $rgbValues[$i+3] = [byte]$alpha
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $bmpData.Scan0, $bytes)
    $outBmp.UnlockBits($bmpData)

    $outName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + "-transparent.png"
    $outPath = Join-Path $mediaDir $outName
    $outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $outBmp.Dispose()
    $bmp.Dispose()
    Write-Host "Processed transparent: $outName"
}
