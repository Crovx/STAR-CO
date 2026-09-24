# Robust Localhost HTTP Server for Windows PowerShell
param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".mp3"  = "audio/mpeg"
    ".wav"  = "audio/wav"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    $listener.Start()
    Write-Host "========================================="
    Write-Host " STAR/CO Localhost Server Running"
    Write-Host " URL: http://localhost:$Port/"
    Write-Host " Root Directory: $Root"
    Write-Host "========================================="

    while ($listener.IsListening) {
        $context = $null
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq "/") {
                $rawPath = "index.html"
            }

            $decodedPath = [System.Uri]::UnescapeDataString($rawPath)
            # Remove query strings or hash if any
            $filePath = Join-Path $Root $decodedPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)

                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $notFoundHtml = "<html><body style='font-family:sans-serif;padding:40px;background:#111;color:#eee'><h2>404 - File Not Found</h2><p>$decodedPath</p></body></html>"
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFoundHtml)
                $response.StatusCode = 404
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } catch {
            Write-Host "Request handler warning: $_"
        } finally {
            if ($null -ne $context) {
                try {
                    $context.Response.OutputStream.Flush()
                    $context.Response.OutputStream.Close()
                } catch {}
                try {
                    $context.Response.Close()
                } catch {}
            }
        }
    }
} catch {
    Write-Host "Server listener stopped: $_"
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
    }
}
