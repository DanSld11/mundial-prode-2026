Add-Type -AssemblyName System.Drawing

$sourceDir = 'D:\mundial2026\public\figuritas_extraidas'
$files = Get-ChildItem $sourceDir -Recurse -Filter '*.png'
$total = $files.Count
$i = 0
$savedMB = 0

Write-Host "Procesando $total archivos PNG..."

foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Resize to max 400px
        $maxW = 400
        $ratioW = $maxW / $img.Width
        $ratioH = $maxW / $img.Height
        $ratio = [math]::Min($ratioW, $ratioH)
        
        if ($ratio -lt 1) {
            $newW = [int]($img.Width * $ratio)
            $newH = [int]($img.Height * $ratio)
            $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.DrawImage($img, 0, 0, $newW, $newH)
            $g.Dispose()
            $img.Dispose()
            $img = $bmp
        }
        
        # Save as JPEG 80% quality
        $jpgPath = [System.IO.Path]::ChangeExtension($file.FullName, '.jpg')
        $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
        $jpegEncoder = $null
        foreach ($enc in $encoders) {
            if ($enc.MimeType -eq 'image/jpeg') {
                $jpegEncoder = $enc
                break
            }
        }
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, 
            [long]80
        )
        $params.Param[0] = $qualityParam
        $img.Save($jpgPath, $jpegEncoder, $params)
        $img.Dispose()
        
        $oldSize = $file.Length
        $newSize = (Get-Item $jpgPath).Length
        $savedMB += ($oldSize - $newSize) / 1MB
        
        Remove-Item $file.FullName -Force
        
        $i++
        if ($i % 50 -eq 0) {
            Write-Host "Procesadas $i/$total - Ahorrado: $([math]::Round($savedMB,1)) MB"
        }
    } catch {
        Write-Warning "Error en $($file.FullName): $_"
    }
}

$totalAfterMB = (Get-ChildItem $sourceDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ""
Write-Host "COMPLETADO: $i/$total archivos convertidos a JPG"
Write-Host "Espacio ahorrado: $([math]::Round($savedMB,1)) MB"
Write-Host "Tamano total ahora: $([math]::Round($totalAfterMB,1)) MB"
