import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { useMapStore, VECTOR_GEOJSON_URL } from '@/store/mapStore';
import { ROUTE_CENTER, ROUTE_ZOOM, pointCloudSections } from '@/data/sections';
import { BASEMAPS } from '@/data/basemaps';
import photosData from '@/data/photos.json';
import type { FeatureCollection, GeoJSON } from 'geojson';
import type { GeoPhoto } from '@/types';
import { areaToolBridge } from '@/map/areaToolBridge';

const photos = photosData as GeoPhoto[];

const LAYER_GROUPS: Record<string, string[]> = {
  traza: ['traza-line-casing', 'traza-line'],
  secciones: ['section-fill', 'section-outline', 'section-label'],
  fotos: ['photos-circle', 'photos-icon'],
};

function escHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function getLayerOpacity(
  layerId: string,
  layers: { id: string; opacity: number; visible: boolean }[]
): number {
  const cfg = layers.find((l) => l.id === layerId);
  if (!cfg || !cfg.visible) return 0;
  return cfg.opacity;
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const distanceAnchorRef = useRef<[number, number] | null>(null);
  const areaRingRef = useRef<[number, number][]>([]);
  const potreeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const commentPopupRef = useRef<maplibregl.Popup | null>(null);
  const pulseMarkerRef = useRef<maplibregl.Marker | null>(null);

  const basemapId = useMapStore((s) => s.basemapId);
  const layers = useMapStore((s) => s.layers);
  const activeTool = useMapStore((s) => s.activeTool);
  const comments = useMapStore((s) => s.comments);
  const pulseCommentId = useMapStore((s) => s.pulseCommentId);
  const setPulseCommentId = useMapStore((s) => s.setPulseCommentId);
  const setSelectedSection = useMapStore((s) => s.setSelectedSection);
  const setShowPotreeViewer = useMapStore((s) => s.setShowPotreeViewer);
  const setSelectedPhoto = useMapStore((s) => s.setSelectedPhoto);
  const setMeasureStatus = useMapStore((s) => s.setMeasureStatus);
  const setCommentDraftCoord = useMapStore((s) => s.setCommentDraftCoord);

  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const basemap = BASEMAPS.find((b) => b.id === basemapId) ?? BASEMAPS[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: 'raster',
            tiles: basemap.tiles,
            tileSize: 256,
            attribution: basemap.attribution,
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: ROUTE_CENTER,
      zoom: ROUTE_ZOOM,
      maxZoom: 20,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 200 }),
      'bottom-left'
    );

    map.on('load', async () => {
      let trazaData: GeoJSON = {
        type: 'FeatureCollection',
        features: [],
      };
      try {
        const res = await fetch(VECTOR_GEOJSON_URL);
        if (res.ok) {
          trazaData = (await res.json()) as GeoJSON;
          if (
            trazaData.type === 'FeatureCollection' &&
            trazaData.features.length > 0
          ) {
            const bbox = turf.bbox(trazaData);
            map.fitBounds(
              [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]],
              ],
              { padding: 48, duration: 0 }
            );
          }
        }
      } catch {
        /* default view */
      }

      map.addSource('traza-geo', { type: 'geojson', data: trazaData });

      map.addLayer({
        id: 'traza-line-casing',
        type: 'line',
        source: 'traza-geo',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 6,
          'line-opacity': 0.35,
        },
      });
      map.addLayer({
        id: 'traza-line',
        type: 'line',
        source: 'traza-geo',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#C8102E',
          'line-width': 3,
          'line-opacity': 0.95,
        },
      });

      const sec = pointCloudSections[0];
      const poly: GeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: sec.id,
              name: sec.name,
              kmStart: sec.kmStart,
              kmEnd: sec.kmEnd,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [sec.bounds[0], sec.bounds[1]],
                  [sec.bounds[2], sec.bounds[1]],
                  [sec.bounds[2], sec.bounds[3]],
                  [sec.bounds[0], sec.bounds[3]],
                  [sec.bounds[0], sec.bounds[1]],
                ],
              ],
            },
          },
        ],
      };

      map.addSource('section', { type: 'geojson', data: poly });
      map.addLayer({
        id: 'section-fill',
        type: 'fill',
        source: 'section',
        paint: {
          'fill-color': '#3498DB',
          'fill-opacity': 0.12,
        },
      });
      map.addLayer({
        id: 'section-outline',
        type: 'line',
        source: 'section',
        paint: {
          'line-color': '#3498DB',
          'line-width': 2,
          'line-dasharray': [4, 2],
          'line-opacity': 0.65,
        },
      });
      map.addLayer({
        id: 'section-label',
        type: 'symbol',
        source: 'section',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#3498DB',
          'text-halo-color': '#1A1A1A',
          'text-halo-width': 1.5,
        },
      });

      const centroid = turf.centroid(poly as FeatureCollection);
      const cCoord = centroid.geometry.coordinates as [number, number];

      const btnWrap = document.createElement('div');
      btnWrap.className = 'pointer-events-auto';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'flex items-center gap-2 rounded-lg border border-[#3498DB] bg-[#1a1a1a]/95 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-[#2a2a2a]';
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3498DB" stroke-width="2" aria-hidden="true">
          <path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"/>
          <path d="M12 12l9-4.5M12 12v9M12 12L3 7.5"/>
        </svg>
        <span>Abrir visor 3D</span>
      `;
      btn.onclick = (ev) => {
        ev.stopPropagation();
        setSelectedSection(sec);
        setShowPotreeViewer(true);
      };
      btnWrap.appendChild(btn);
      potreeMarkerRef.current = new maplibregl.Marker({ element: btnWrap })
        .setLngLat(cCoord)
        .addTo(map);

      map.on('mouseenter', 'section-fill', () => {
        if (activeToolRef.current === 'select') map.getCanvas().style.cursor = 'default';
      });
      map.on('mouseleave', 'section-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      const photoFeatures = photos.map((p) => ({
        type: 'Feature' as const,
        properties: {
          id: p.id,
          desc: p.desc,
          url: p.url,
          date: p.date,
          km: p.km,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: p.coord,
        },
      }));

      map.addSource('photos', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: photoFeatures },
      });
      map.addLayer({
        id: 'photos-circle',
        type: 'circle',
        source: 'photos',
        paint: {
          'circle-radius': 9,
          'circle-color': '#F39C12',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });
      map.addLayer({
        id: 'photos-icon',
        type: 'symbol',
        source: 'photos',
        layout: {
          'text-field': '📷',
          'text-size': 14,
          'text-allow-overlap': true,
        },
        paint: {
          'text-opacity': 1,
        },
      });

      map.on('click', 'photos-circle', (e) => {
        if (activeToolRef.current !== 'select') return;
        if (!e.features?.length) return;
        const props = e.features[0].properties as { id?: number };
        const photo = photos.find((p) => p.id === props?.id);
        if (photo) setSelectedPhoto(photo);
      });
      map.on('mouseenter', 'photos-circle', () => {
        if (activeToolRef.current === 'select') map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'photos-circle', () => {
        map.getCanvas().style.cursor = '';
      });

      map.addSource('measure-draw', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'measure-line',
        type: 'line',
        source: 'measure-draw',
        paint: {
          'line-color': '#E74C3C',
          'line-width': 2,
          'line-dasharray': [2, 1],
        },
      });
      map.addLayer({
        id: 'measure-fill',
        type: 'fill',
        source: 'measure-draw',
        paint: {
          'fill-color': '#E74C3C',
          'fill-opacity': 0.2,
        },
      });

      map.addSource('measure-verts', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'measure-vert-bg',
        type: 'circle',
        source: 'measure-verts',
        paint: {
          'circle-radius': 11,
          'circle-color': '#E74C3C',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
      map.addLayer({
        id: 'measure-vert-num',
        type: 'symbol',
        source: 'measure-verts',
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 11,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addSource('comments-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'comments-circle',
        type: 'circle',
        source: 'comments-src',
        paint: {
          'circle-radius': 8,
          'circle-color': '#9B59B6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      const updateMeasureDraw = (features: FeatureCollection['features']) => {
        const s = map.getSource('measure-draw') as maplibregl.GeoJSONSource;
        s.setData({ type: 'FeatureCollection', features });
      };

      const updateMeasureVerts = (points: [number, number][]) => {
        const feats = points.map((pt, i) => ({
          type: 'Feature' as const,
          properties: { label: String(i + 1) },
          geometry: { type: 'Point' as const, coordinates: pt },
        }));
        const s = map.getSource('measure-verts') as maplibregl.GeoJSONSource;
        s.setData({ type: 'FeatureCollection', features: feats });
      };

      const clearMeasureVerts = () => {
        updateMeasureVerts([]);
      };

      const finalizeAreaPolygon = () => {
        const ring = areaRingRef.current;
        if (ring.length < 3) {
          setMeasureStatus('Se necesitan al menos 3 vértices.');
          return;
        }
        const closedRing: [number, number][] = [
          ...ring,
          ring[0],
        ] as [number, number][];
        const gon = turf.polygon([closedRing]);
        const areaM2 = turf.area(gon);
        const ha = areaM2 / 10000;
        setMeasureStatus(
          ha >= 0.01
            ? `Área: ${ha.toFixed(4)} ha (${areaM2.toFixed(0)} m²)`
            : `Área: ${areaM2.toFixed(1)} m²`
        );
        updateMeasureDraw([
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [closedRing] },
          },
        ]);
        areaRingRef.current = [];
        clearMeasureVerts();
      };

      areaToolBridge.closePolygon = finalizeAreaPolygon;

      map.on('click', 'comments-circle', (e) => {
        if (activeToolRef.current !== 'select') return;
        if (!e.features?.length) return;
        const feat = e.features[0];
        const p = feat.properties as {
          id?: string;
          userName?: string;
          text?: string;
        };
        if (!p?.id) return;
        commentPopupRef.current?.remove();
        const html = `<div style="max-width:240px;font:12px system-ui,sans-serif;color:#1a1a1a">
          <div style="font-weight:600;margin-bottom:6px;color:#C8102E">${escHtml(p.userName ?? '')}</div>
          <div style="white-space:pre-wrap;line-height:1.4">${escHtml(p.text ?? '')}</div>
        </div>`;
        const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
        commentPopupRef.current = popup;
      });
      map.on('mouseenter', 'comments-circle', () => {
        if (activeToolRef.current === 'select') map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'comments-circle', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', (e) => {
        const tool = activeToolRef.current;
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (tool === 'measure-distance') {
          if (!distanceAnchorRef.current) {
            distanceAnchorRef.current = lngLat;
            updateMeasureVerts([lngLat]);
            setMeasureStatus(
              'PASO 2/2: haz clic en el punto final (ya marcamos el punto ①).'
            );
            return;
          }
          const a = distanceAnchorRef.current;
          const b = lngLat;
          updateMeasureVerts([a, b]);
          const line = turf.lineString([a, b]);
          const km = turf.length(line, { units: 'kilometers' });
          const m = km * 1000;
          const label =
            m < 1000
              ? `Listo. Distancia: ${m.toFixed(1)} m (puntos ① → ②).`
              : `Listo. Distancia: ${km.toFixed(3)} km (puntos ① → ②).`;
          setMeasureStatus(label);
          updateMeasureDraw([
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: [a, b] },
            },
          ]);
          distanceAnchorRef.current = null;
          return;
        }

        if (tool === 'measure-area') {
          areaRingRef.current = [...areaRingRef.current, lngLat];
          const ring = areaRingRef.current;
          updateMeasureVerts(ring);
          setMeasureStatus(
            `Vértice ${ring.length} añadido. Sigue haciendo clic o pulsa «Cerrar polígono» (mín. 3 vértices).`
          );
          if (ring.length >= 2) {
            updateMeasureDraw([
              {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: ring },
              },
            ]);
          } else {
            updateMeasureDraw([]);
          }
          return;
        }

        if (tool === 'comment') {
          setCommentDraftCoord(lngLat);
        }
      });

      const applyLayerPaint = () => {
        const st = useMapStore.getState().layers;
        const opTraza = getLayerOpacity('traza', st);
        const opSec = getLayerOpacity('secciones', st);
        const opFotos = getLayerOpacity('fotos', st);
        if (map.getLayer('traza-line-casing')) {
          map.setPaintProperty('traza-line-casing', 'line-opacity', 0.35 * opTraza);
          map.setPaintProperty('traza-line', 'line-opacity', 0.95 * opTraza);
        }
        if (map.getLayer('section-fill')) {
          map.setPaintProperty('section-fill', 'fill-opacity', 0.12 * opSec);
          map.setPaintProperty('section-outline', 'line-opacity', 0.65 * opSec);
          map.setPaintProperty('section-label', 'text-opacity', opSec);
        }
        if (map.getLayer('photos-circle')) {
          map.setPaintProperty('photos-circle', 'circle-opacity', 0.95 * opFotos);
          map.setPaintProperty('photos-icon', 'text-opacity', opFotos);
        }
        (['traza', 'secciones', 'fotos'] as const).forEach((layerId) => {
          const ids = LAYER_GROUPS[layerId];
          const vis = st.find((l) => l.id === layerId)?.visible
            ? 'visible'
            : 'none';
          ids.forEach((id) => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
          });
        });
      };

      map.once('idle', applyLayerPaint);
    });

    mapRef.current = map;

    const container = mapContainer.current;
    const ro =
      typeof ResizeObserver !== 'undefined' && container
        ? new ResizeObserver(() => {
            map.resize();
          })
        : null;
    ro?.observe(container);

    const onTemocsaResize = () => map.resize();
    window.addEventListener('temocsa-map-resize', onTemocsaResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener('temocsa-map-resize', onTemocsaResize);
      areaToolBridge.closePolygon = null;
      potreeMarkerRef.current?.remove();
      potreeMarkerRef.current = null;
      commentPopupRef.current?.remove();
      commentPopupRef.current = null;
      pulseMarkerRef.current?.remove();
      pulseMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const next = BASEMAPS.find((b) => b.id === basemapId);
    if (!next) return;
    const src = map.getSource('basemap') as maplibregl.RasterTileSource | undefined;
    if (src && typeof src.setTiles === 'function') {
      src.setTiles(next.tiles);
    }
    const att = document.querySelector('.maplibregl-ctrl-attrib-inner');
    if (att) att.innerHTML = next.attribution;
  }, [basemapId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    const st = useMapStore.getState().layers;
    const opTraza = getLayerOpacity('traza', st);
    const opSec = getLayerOpacity('secciones', st);
    const opFotos = getLayerOpacity('fotos', st);

    if (map.getLayer('traza-line-casing')) {
      map.setPaintProperty('traza-line-casing', 'line-opacity', 0.35 * opTraza);
      map.setPaintProperty('traza-line', 'line-opacity', 0.95 * opTraza);
    }
    if (map.getLayer('section-fill')) {
      map.setPaintProperty('section-fill', 'fill-opacity', 0.12 * opSec);
      map.setPaintProperty('section-outline', 'line-opacity', 0.65 * opSec);
      map.setPaintProperty('section-label', 'text-opacity', opSec);
    }
    if (map.getLayer('photos-circle')) {
      map.setPaintProperty('photos-circle', 'circle-opacity', 0.95 * opFotos);
      map.setPaintProperty('photos-icon', 'text-opacity', opFotos);
    }

    (['traza', 'secciones', 'fotos'] as const).forEach((layerId) => {
      const ids = LAYER_GROUPS[layerId];
      const vis = st.find((l) => l.id === layerId)?.visible ? 'visible' : 'none';
      ids.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
      });
    });
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const src = map.getSource('comments-src') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const features = comments.map((c) => ({
      type: 'Feature' as const,
      properties: {
        id: c.id,
        userName: c.userName,
        text: c.text,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: c.coord,
      },
    }));
    src.setData({ type: 'FeatureCollection', features });
  }, [comments]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    const tool = activeTool;
    const mdraw = map.getSource('measure-draw') as maplibregl.GeoJSONSource | undefined;
    const mvert = map.getSource('measure-verts') as maplibregl.GeoJSONSource | undefined;

    const clearVerts = () => {
      mvert?.setData({ type: 'FeatureCollection', features: [] });
    };

    if (tool === 'measure-area') {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }

    if (tool === 'select') {
      mdraw?.setData({ type: 'FeatureCollection', features: [] });
      clearVerts();
      distanceAnchorRef.current = null;
      areaRingRef.current = [];
      setMeasureStatus(null);
      return;
    }

    if (tool === 'measure-distance') {
      distanceAnchorRef.current = null;
      setMeasureStatus(
        'PASO 1/2: haz clic en el punto inicial (aparecerá el número ①).'
      );
      mdraw?.setData({ type: 'FeatureCollection', features: [] });
      clearVerts();
      return;
    }

    if (tool === 'measure-area') {
      areaRingRef.current = [];
      setMeasureStatus(
        'Área: cada clic añade un vértice numerado. Luego «Cerrar polígono y calcular área» (mínimo 3).'
      );
      mdraw?.setData({ type: 'FeatureCollection', features: [] });
      clearVerts();
      return;
    }

    if (tool === 'comment') {
      mdraw?.setData({ type: 'FeatureCollection', features: [] });
      clearVerts();
      distanceAnchorRef.current = null;
      areaRingRef.current = [];
      setMeasureStatus('Clic en el mapa para colocar el comentario.');
    }
  }, [activeTool, setMeasureStatus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    pulseMarkerRef.current?.remove();
    pulseMarkerRef.current = null;

    if (!pulseCommentId) return;

    const c = useMapStore.getState().comments.find((x) => x.id === pulseCommentId);
    if (!c) {
      setPulseCommentId(null);
      return;
    }

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="comment-pulse-wrap">
        <div class="comment-pulse-ring"></div>
        <div class="comment-pulse-ring comment-pulse-ring--delay"></div>
        <div class="comment-pulse-dot"></div>
      </div>
    `;
    const root = wrap.firstElementChild as HTMLElement;

    const marker = new maplibregl.Marker({ element: root })
      .setLngLat(c.coord)
      .addTo(map);
    pulseMarkerRef.current = marker;

    const t = window.setTimeout(() => {
      setPulseCommentId(null);
    }, 45000);

    return () => {
      clearTimeout(t);
      marker.remove();
      if (pulseMarkerRef.current === marker) pulseMarkerRef.current = null;
    };
  }, [pulseCommentId, setPulseCommentId]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
