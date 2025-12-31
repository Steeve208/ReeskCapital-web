# APK de RSC Mining

Este directorio contiene el APK de la aplicación para descarga directa desde la web.

## Archivo

- **rsc-mining.apk**: APK de la aplicación Android

## Uso en la Web

Para vincular el botón de descarga en tu sitio web, usa esta ruta:

```
/downloads/rsc-mining.apk
```

O la ruta completa relativa:

```
public/downloads/rsc-mining.apk
```

## Actualizar el APK

Cuando generes un nuevo build:

1. Ejecuta: `npm run download-apk`

2. O manualmente: `powershell -ExecutionPolicy Bypass -File download-apk.ps1`

El script descargará automáticamente el APK más reciente y lo guardará aquí.

## Ejemplo de Botón de Descarga

```html
<a href="/downloads/rsc-mining.apk" 
   download="rsc-mining.apk" 
   style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    📱 Descargar App Android
</a>
```

## Notas

- El archivo se actualiza automáticamente cuando ejecutas el script de descarga
- Asegúrate de que tu servidor web tenga permisos para servir archivos .apk
- El archivo puede ser grande (50-100MB), considera mostrar un indicador de progreso


