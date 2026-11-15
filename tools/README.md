# 🛠 Directorio de Herramientas Operativas (Tools)

Este directorio contiene binarios y herramientas de soporte local para desarrollo y demostración.

## Cloudflare Tunnel (`cloudflared`)

Para levantar un túnel seguro público hacia el proxy inverso local (`http://localhost:8088`):

1. Descargar el binario oficial de `cloudflared` para Windows:
   * URL de descarga: [https://github.com/cloudflare/cloudflared/releases/latest](https://github.com/cloudflare/cloudflared/releases/latest)
   * Colocar `cloudflared.exe` en esta carpeta (`tools/`).

2. Ejecutar el túnel:
   ```powershell
   .\tools\cloudflared.exe tunnel --url http://localhost:8088
   ```

*Nota: Por directivas de control de versiones y tamaño de repositorio, los archivos `.exe` se encuentran excluidos del control de versiones mediante `.gitignore`.*
