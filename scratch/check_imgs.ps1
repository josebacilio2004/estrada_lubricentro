Add-Type -AssemblyName System.Drawing
$mediaDir = "D:\jose\Lubricentro_Estrada\frontend\public\media"
Get-ChildItem -Path $mediaDir -Filter "*.jpg" | ForEach-Object {
    $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $c = $bmp.GetPixel(2, 2)
    Write-Host "$($_.Name) => $($bmp.Width)x$($bmp.Height) | Corner Color: ($($c.R), $($c.G), $($c.B))"
    $bmp.Dispose()
}
