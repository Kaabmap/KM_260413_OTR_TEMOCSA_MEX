# TEMOCSA Geoportal — Visor GeoBIM de Infraestructura Lineal

_Repositorio:_ `KM_260413_OTR_TEMOCSA_MEX` — Demo de geoportal para TEMOCSA Constructora.

Geoportal avanzado para la supervisión de proyectos carreteros. Caso de estudio: **Autopista Las Varas — Puerto Vallarta**.

Desarrollado por **Kaab Map** para **TEMOCSA**.

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| React + Vite | Framework SPA con TypeScript |
| Tailwind CSS v4 | Estilos con paleta TEMOCSA |
| MapLibre GL JS | Mapa 2D interactivo |
| PMTiles (Protomaps) | Datos vectoriales sin servidor |
| Potree | Visualización 3D de nubes de puntos |
| Zustand | Estado global y autenticación |

## Inicio Rápido

```bash
npm install
npm run dev
```

Abre http://localhost:5173 y usa las credenciales de demo:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@temocsa.com | AdminTemocsa |
| Editor | editor@temocsa.com | EditorTemocsa |
| Visor | visor@temocsa.com | VisorTemocsa |

## Estructura del Proyecto

```
src/
├── components/
│   ├── admin/         # Panel de gestión (usuarios, proyectos)
│   ├── auth/          # Login y autenticación
│   ├── dashboard/     # Métricas y KPIs overlay
│   ├── layout/        # Header, Sidebar
│   ├── map/           # MapView (MapLibre), Toolbar
│   ├── photos/        # Modal de fotografías georreferenciadas
│   ├── potree/        # Visor de nubes de puntos 3D
│   └── ui/            # Componentes UI reutilizables
├── data/              # Datos JSON y configuraciones
├── hooks/             # Custom hooks
├── pages/             # Páginas principales
├── store/             # Zustand stores (auth, map)
└── types/             # TypeScript interfaces
public/
├── data/
│   ├── vector/        # Archivos .pmtiles
│   └── pointclouds/   # Octrees Potree (por sección)
├── photos/            # Fotografías de obra
└── potree/            # Visor Potree (HTML standalone)
```

## Configuración de Datos

### Datos Vectoriales (PMTiles)
Coloca tus `.pmtiles` en `/public/data/vector/`. El protocolo Protomaps los lee directamente sin backend.

### Nubes de Puntos (Potree)
1. Convierte tus `.laz` con [PotreeConverter](https://github.com/potree/PotreeConverter)
2. Coloca el resultado en `/public/data/pointclouds/seccion_N/`
3. Descarga [Potree](https://github.com/potree/potree/releases) y copia los archivos a `/public/potree/`

### Fotografías Georreferenciadas
1. Coloca las fotos en `/public/photos/`
2. Edita `src/data/photos.json` con las coordenadas y descripciones

## Despliegue

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### GitHub Pages
```bash
npm run build
# Sube la carpeta dist/ a tu repositorio
```

### Datos Pesados — Google Cloud Storage
Para archivos .pmtiles y octrees Potree pesados, se recomienda usar un bucket de GCS:

1. Crea un bucket en Google Cloud Console
2. Sube los archivos y configura CORS
3. Actualiza las URLs de las fuentes en el código para apuntar al bucket

```json
// Ejemplo CORS para el bucket
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Range", "Accept-Ranges", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

## Roles y Permisos

| Permiso | Admin | Editor | Visor |
|---|:---:|:---:|:---:|
| Navegación del mapa | ✓ | ✓ | ✓ |
| Ver nubes de puntos | ✓ | ✓ | ✓ |
| Ver fotografías | ✓ | ✓ | ✓ |
| Comentarios GeoBIM | ✓ | ✓ | ✗ |
| Gestión de usuarios | ✓ | ✗ | ✗ |
| Gestión de proyectos | ✓ | ✗ | ✗ |

## Licencia

Proyecto propietario — Kaab Map © 2025
