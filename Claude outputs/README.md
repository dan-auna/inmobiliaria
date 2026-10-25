# Nuvia · Dashboard inmobiliario

Prototipo visual de un panel comercial para inmobiliarias en Perú: resumen de ventas, proyectos, propiedades, asesores y CRM con tablero Kanban. Todos los datos son ficticios y se generan en el navegador.

## Cómo verlo

- **En tu computadora:** abre `index.html` con doble clic (Chrome o Edge). Necesita internet solo para cargar las fuentes.
- **En GitHub Pages:** sube la carpeta a un repositorio, entra a *Settings → Pages*, elige la rama `main` y la carpeta `/ (root)`. El sitio queda publicado sin pasos de compilación.

## Estructura

```
index.html                         Página principal
css/styles.css                     Estilos y tokens de marca (modo claro y oscuro)
js/data.js                         Datos de demostración (proyectos, unidades, asesores, leads)
js/core.js                         Utilidades, estado, moneda y gráficos SVG
js/views-resumen-proyectos.js      Pantallas Resumen y Proyectos
js/views-propiedades-asesores-crm.js  Pantallas Propiedades, Asesores y CRM
js/app.js                          Paneles laterales, acciones del CRM, rutas y eventos
```

Los scripts se cargan en ese orden y comparten variables globales; no hay dependencias ni paso de compilación.

## Siguiente paso: conectar el back

`js/data.js` es lo único que genera datos. Para usar datos reales, reemplaza ese archivo por llamadas a tu API y conserva la forma de los objetos `PROJ`, `UNITS`, `ADV` y `LEADS`.

## Marca

Colores: Tinta Andina `#0B1625`, Verde Petróleo `#0A7570` / `#34C0B8`, Oro Costa `#B98A2C` / `#E2B552`, Niebla `#F2F5F8`. Tipografía: Instrument Serif (títulos) y Plus Jakarta Sans (interfaz).

El plan de producto, las historias de usuario y los prompts para Claude Design están en el documento "Nuvia · Plan de producto, marca y vista 3D" de Claude.
