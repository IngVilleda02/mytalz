# MYTALZ · Optimiza fotos de trabajos para la página
# ---------------------------------------------------------------
# Toma las fotos originales (celular, cámara) de una carpeta y genera
# dos versiones ligeras de cada una: <nombre>-800.jpg y <nombre>-1600.jpg
# en site/assets/img/trabajos/. Respeta la orientación del celular.
#
# Uso (desde la carpeta MYTALZ):
#   powershell -ExecutionPolicy Bypass -File herramientas\optimizar-fotos.ps1
#   powershell -ExecutionPolicy Bypass -File herramientas\optimizar-fotos.ps1 -Origen "C:\ruta\a\mis fotos"
#
# Nombra los archivos originales como quieras que aparezcan, por ejemplo:
#   cnc-01.jpg, troquelado-01.jpg, soldadura-01.jpg, ensamble-01.jpg
# Después agrega cada foto en site/assets/js/config.js (sección gallery).

param(
  [string]$Origen = (Join-Path $PSScriptRoot "..\Fotos-trabajos"),
  [string]$Destino = (Join-Path $PSScriptRoot "..\site\assets\img\trabajos"),
  [int]$Calidad = 80
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName PresentationCore

if (-not (Test-Path $Origen)) {
  New-Item -ItemType Directory -Force $Origen | Out-Null
  Write-Host "Creé la carpeta '$Origen'. Copia ahí las fotos originales y vuelve a ejecutar el script."
  exit 0
}
New-Item -ItemType Directory -Force $Destino | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

$fotos = Get-ChildItem $Origen -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' }
if (-not $fotos) { Write-Host "No encontré fotos .jpg, .png o .webp en '$Origen'."; exit 0 }

foreach ($f in $fotos) {
  if ($f.Extension -ieq '.webp') {
    # System.Drawing no lee WebP: se decodifica con el códec de Windows y se pasa como PNG en memoria
    $fs = [IO.File]::OpenRead($f.FullName)
    try {
      $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, 'PreservePixelFormat', 'OnLoad')
      $penc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
      $penc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($dec.Frames[0]))
      $ms = New-Object IO.MemoryStream; $penc.Save($ms); $ms.Position = 0
      $img = [System.Drawing.Image]::FromStream($ms)
    } finally { $fs.Close() }
  } else {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
  }
  try {
    if ($img.PropertyIdList -contains 0x0112) {
      switch ($img.GetPropertyItem(0x0112).Value[0]) {
        3 { $img.RotateFlip('Rotate180FlipNone') }
        6 { $img.RotateFlip('Rotate90FlipNone') }
        8 { $img.RotateFlip('Rotate270FlipNone') }
      }
    }
    $base = ([IO.Path]::GetFileNameWithoutExtension($f.Name)).ToLower() -replace '[^a-z0-9\-]+', '-'
    foreach ($w in 800, 1600) {
      $ancho = [Math]::Min($w, $img.Width)
      $alto = [int]($img.Height * $ancho / $img.Width)
      $bmp = New-Object System.Drawing.Bitmap $ancho, $alto
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'; $g.SmoothingMode = 'HighQuality'
      $g.DrawImage($img, 0, 0, $ancho, $alto)
      $bmp.Save((Join-Path $Destino "$base-$w.jpg"), $codec, $ep)
      $g.Dispose(); $bmp.Dispose()
    }
    Write-Host ("OK  {0}  ->  assets/img/trabajos/{1}  ({2}x{3})" -f $f.Name, $base, $img.Width, $img.Height)
  } finally { $img.Dispose() }
}

Write-Host ""
Write-Host "Listo. Agrega cada foto en site/assets/js/config.js, por ejemplo:"
Write-Host '  { src: "assets/img/trabajos/cnc-01", alt: "Descripción de lo que se ve en la foto" },'
