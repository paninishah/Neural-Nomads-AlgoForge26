import React, {
  useEffect, useRef, useState, useMemo, useCallback
} from 'react';
import * as d3 from 'd3';
import { AnimatePresence, motion } from 'framer-motion';
import { useGeoData } from '../hooks/useGeoData';
import { safeCompare } from '../lib/mapUtils';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import './MapStyles.css';

/* ── Types ─────────────────────────────────────────── */
type Layer = 'market' | 'fraud' | 'loan' | 'legal';

interface RegionData {
  state: string;
  district?: string;
  value: string;
  comparison: string;
  recommendation: string;
  intensity: number;          // 0-1
  trend: 'up' | 'down' | 'stable';
  fraud_alerts: number;
  loan_score: number;
  legal_cases: number;
}

interface TooltipState {
  data: RegionData;
  x: number;
  y: number;
}

interface IndiaMapProps {
  layer: Layer;
  onRegionHover?: (data: RegionData | null) => void;
}

/* ── Layer colour palettes ──────────────────────────── */
const LAYER_COLORS: Record<Layer, (t: number) => string> = {
  market: d3.interpolateRgbBasis(['#ef4444', '#f97316', '#eab308', '#22c55e']),
  fraud:  d3.interpolateRgbBasis(['#22c55e', '#eab308', '#ef4444']),
  loan:   d3.interpolateRgbBasis(['#ef4444', '#60a5fa', '#3b82f6']),
  legal:  d3.interpolateRgbBasis(['#22c55e', '#c084fc', '#a855f7']),
};

/* ── Deterministic mock data ────────────────────────── */
function getRegionData(name: string, layer: Layer, stateName?: string, realDataMap?: Record<string, any>): RegionData {
  
  if (layer === 'market' && realDataMap && realDataMap[name.toLowerCase()]) {
    const d = realDataMap[name.toLowerCase()];
    const isUp = d.price > 2000;
    return {
      state: stateName || name,
      district: stateName ? name : undefined,
      value: `₹${d.price.toLocaleString()}/qtl`,
      comparison: isUp ? `↑ High Demand Area` : `↓ Below Average`,
      recommendation: isUp ? "Sell here for maximum profit margin." : "Hold crops or locate nearby mandi with higher rates.",
      intensity: d.intensity || Math.min(1.0, d.price / 4000),
      trend: isUp ? 'up' : 'down',
      fraud_alerts: 0,
      loan_score: 0.8,
      legal_cases: 0,
    };
  }

  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const raw = (h % 100) / 100;

  // Shuffle intensity per layer so colours meaningfully differ
  const layerSeed = { market: 0, fraud: 37, loan: 61, legal: 83 }[layer];
  const intensity = ((h + layerSeed) % 100) / 100;

  const price = 1400 + (h % 900);

  const market_recs  = ['Sell within 2 days for best profit.', 'Hold stock — prices rising next week.', 'Optimal selling window: tomorrow morning.'];
  const fraud_recs   = ['Verify buyer identity before transaction.', 'Cross-check mandi receipts.', 'Use official payment channels only.'];
  const loan_recs    = ['KCC renewal deadline in 7 days.', 'Subsidy window open — apply now.', 'Credit score eligible for enhanced limit.'];
  const legal_recs   = ['Obtain notarised land records.', 'Dispute mediation available at block office.', 'Right-of-way documentation required.'];

  const recPool = { market: market_recs, fraud: fraud_recs, loan: loan_recs, legal: legal_recs }[layer];

  const pctDiff = ((h * 7) % 20) + 1;
  const upward  = h % 2 === 0;

  return {
    state:       stateName || name,
    district:    stateName ? name : undefined,
    value:       layer === 'market'
      ? `₹${price.toLocaleString()}/qtl`
      : layer === 'fraud'
      ? `${(h % 12) + 1} alerts`
      : layer === 'loan'
      ? `${Math.round(60 + raw * 35)}% approved`
      : `${(h % 15) + 1} cases`,
    comparison:  upward
      ? `↑ ${pctDiff}% higher than nearby`
      : `↓ ${pctDiff}% lower than nearby`,
    recommendation: recPool[h % recPool.length],
    intensity,
    trend:       upward ? 'up' : h % 3 === 0 ? 'stable' : 'down',
    fraud_alerts: (h % 12) + 1,
    loan_score:   0.5 + raw * 0.45,
    legal_cases:  (h % 15) + 1,
  };
}

/* ── Main component ─────────────────────────────────── */
const IndiaMap: React.FC<IndiaMapProps> = ({ layer, onRegionHover }) => {
  const svgRef      = useRef<SVGSVGElement>(null);
  const zoomRef     = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef        = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const dimRef      = useRef(false);           // track dimmed state synchronously

  const [viewState, setViewState]         = useState<'india' | 'state'>('india');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tooltip, setTooltip]             = useState<TooltipState | null>(null);
  const [realMapData, setRealMapData]     = useState<Record<string, any>>({});

  useEffect(() => {
    if (layer === 'market') {
      apiClient.get('/heatmap/summary').then((res) => {
        if (res.data?.status === 'success') {
           const heatDict: Record<string, any> = {};
           res.data.data.forEach((d: any) => {
             // Map summary data back to states/districts for coloring 
             // Normally /heatmap/prices?crop=wheat works best, but summary gives us generic top market hotspots.
             const key = (d.name.split(' ')[0] || d.name).toLowerCase();
             heatDict[key] = { price: d.price, intensity: d.intensity };
           });
           setRealMapData(heatDict);
        }
      }).catch(console.error);
    }
  }, [layer]);

  const STATE_URL    = '/india_state.geojson';
  const DISTRICT_URL = '/india_district.geojson';

  const { data: stateData,    loading: statesLoading    } = useGeoData(STATE_URL);
  const { data: districtData, loading: districtsLoading } = useGeoData(DISTRICT_URL);

  const width  = 800;
  const height = 900;

  const projection = useMemo(() =>
    d3.geoMercator()
      .scale(1300)
      .center([82.8, 22])
      .translate([width / 2, height / 2])
  , []);

  const path = useMemo(() => d3.geoPath().projection(projection), [projection]);

  /* Memoized district filter with normalisation */
  const filteredDistricts = useMemo(() => {
    if (!selectedState || !districtData) return [];
    return districtData.features.filter((f: any) =>
      safeCompare(
        f.properties.st_nm || f.properties.NAME_1 || '',
        selectedState
      )
    );
  }, [selectedState, districtData]);

  /* ── Tooltip boundary clamping ─────────────────────── */
  const clampTooltip = useCallback((clientX: number, clientY: number) => {
    const TW = 268, TH = 170;
    const vw = window.innerWidth,  vh = window.innerHeight;
    const x = clientX + 18 + TW > vw ? clientX - TW - 18 : clientX + 18;
    const y = clientY + TH       > vh ? clientY - TH       : clientY + 10;
    return { x, y };
  }, []);

  /* ── Colour function for current layer ─────────────── */
  const colourFor = useCallback((name: string, isDistrict: boolean) => {
    const d = getRegionData(name, layer, isDistrict ? (selectedState ?? undefined) : undefined, realMapData);
    return LAYER_COLORS[layer](d.intensity);
  }, [layer, selectedState, realMapData]);

  /* ── Re-colour all paths when layer changes ─────────── */
  useEffect(() => {
    if (!gRef.current) return;
    const isDistrict = viewState === 'state';
    gRef.current.selectAll<SVGPathElement, any>('.region')
      .transition()
      .duration(700)
      .ease(d3.easeCubicInOut)
      .attr('fill', (d: any) => {
        const name = isDistrict
          ? (d.properties.NAME_2 || d.properties.dist_nm || d.properties.district || '')
          : (d.properties.NAME_1 || '');
        return colourFor(name, isDistrict);
      });
  }, [layer, colourFor, viewState]);

  /* ── Core D3 setup (runs once, or on stateData change) */
  useEffect(() => {
    if (!svgRef.current || !stateData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    /* Defs — glow filter */
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', 'region-glow')
      .attr('x', '-40%').attr('y', '-40%')
      .attr('width', '180%').attr('height', '180%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3').attr('result', 'blur');
    const gMerge = glowFilter.append('feMerge');
    gMerge.append('feMergeNode').attr('in', 'blur');
    gMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');
    gRef.current = g;

    /* Zoom */
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);
    zoomRef.current = zoom;

    drawStates(svg, g, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateData]);

  /* ── Draw states ─────────────────────────────────────── */
  const drawStates = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    g:   d3.Selection<SVGGElement,   unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
  ) => {
    if (!stateData) return;

    g.selectAll('.region').remove();
    g.selectAll('.hotspot').remove();

    const regions = g.selectAll<SVGPathElement, any>('.region')
      .data(stateData.features)
      .enter().append('path')
      .attr('class', 'region')
      .attr('d', path as any)
      .attr('fill', (d: any) => colourFor(d.properties.NAME_1 || '', false))
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer');

    /* Fade in */
    regions.attr('opacity', 0)
      .transition().duration(600).attr('opacity', 1);

    /* Hover */
    regions
      .on('mouseover', function(event, d: any) {
        if (isTransitioning) return;
        const name = d.properties.NAME_1 || '';
        const data = getRegionData(name, layer);

        /* Dim others */
        dimRef.current = true;
        regions.classed('hovered', false).attr('opacity', 0.25);
        d3.select(this)
          .classed('hovered', true)
          .raise()
          .transition().duration(180)
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .style('filter', 'url(#region-glow)');

        const pos = clampTooltip(event.clientX, event.clientY);
        setTooltip({ data, x: pos.x, y: pos.y });
        onRegionHover?.(data);
      })
      .on('mousemove', function(event) {
        if (!tooltip) return;
        const pos = clampTooltip(event.clientX, event.clientY);
        setTooltip(prev => prev ? { ...prev, x: pos.x, y: pos.y } : null);
      })
      .on('mouseout', function() {
        dimRef.current = false;
        regions.classed('hovered', false)
          .transition().duration(250)
          .attr('opacity', 1)
          .attr('stroke', 'rgba(255,255,255,0.12)')
          .attr('stroke-width', 0.5)
          .style('filter', null);
        setTooltip(null);
        onRegionHover?.(null);
      })
      .on('click', function(_event, d: any) {
        if (isTransitioning) return;
        drillDown(d, svg, g, zoom);
      });

    /* Hotspot pulses */
    const hotFeatures = stateData.features.filter((d: any) => {
      const i = getRegionData(d.properties.NAME_1 || '', layer).intensity;
      return i > 0.82;
    });

    hotFeatures.forEach((d: any) => {
      const [cx, cy] = path.centroid(d);
      if (!isFinite(cx) || !isFinite(cy)) return;
      g.append('circle')
        .attr('class', 'hotspot')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#facc15')
        .attr('fill-opacity', 0.85)
        .attr('pointer-events', 'none')
        .attr('class', 'hotspot-circle');
    });
  };

  /* ── Drilldown zoom ──────────────────────────────────── */
  const drillDown = (
    d: any,
    svg:  d3.Selection<SVGSVGElement, unknown, null, undefined>,
    g:    d3.Selection<SVGGElement,   unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
  ) => {
    const stateName = d.properties.NAME_1;
    setSelectedState(stateName);
    setIsTransitioning(true);
    setTooltip(null);

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    const dx    = x1 - x0, dy = y1 - y0;
    const cx    = (x0 + x1) / 2,   cy = (y0 + y1) / 2;
    const scale = Math.max(1, Math.min(10, 0.85 / Math.max(dx / width, dy / height)));
    const tx    = width  / 2 - scale * cx;
    const ty    = height / 2 - scale * cy;

    /* Dim others, highlight selected */
    g.selectAll<SVGPathElement, any>('.region')
      .transition().duration(400)
      .attr('opacity', (f: any) =>
        f.properties.NAME_1 === stateName ? 1 : 0.12
      );

    svg.transition()
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
      .on('end', () => {
        setViewState('state');
        setIsTransitioning(false);
        onRegionHover?.(null);
      });
  };

  /* ── Draw districts once we enter state view ─────────── */
  useEffect(() => {
    if (viewState !== 'state' || !gRef.current || filteredDistricts.length === 0) return;

    const g = gRef.current;
    g.selectAll('.region').remove();
    g.selectAll('.hotspot').remove();

    const districts = g.selectAll<SVGPathElement, any>('.region')
      .data(filteredDistricts)
      .enter().append('path')
      .attr('class', 'region')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.dist_nm || '';
        return colourFor(name, true);
      })
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-width', 0.7)
      .attr('opacity', 0)
      .attr('cursor', 'pointer');

    /* Fade in */
    districts.transition().duration(500).attr('opacity', 1);

    /* Hover */
    districts
      .on('mouseover', function(event, d: any) {
        const name = d.properties.NAME_2 || d.properties.dist_nm || '';
        const data = getRegionData(name, layer, selectedState ?? undefined);

        districts.attr('opacity', 0.25);
        d3.select(this)
          .raise()
          .transition().duration(150)
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.8)
          .style('filter', 'url(#region-glow)');

        const pos = clampTooltip(event.clientX, event.clientY);
        setTooltip({ data, x: pos.x, y: pos.y });
        onRegionHover?.(data);
      })
      .on('mousemove', function(event) {
        const pos = clampTooltip(event.clientX, event.clientY);
        setTooltip(prev => prev ? { ...prev, x: pos.x, y: pos.y } : null);
      })
      .on('mouseout', function() {
        districts
          .transition().duration(200)
          .attr('opacity', 1)
          .attr('stroke', 'rgba(255,255,255,0.15)')
          .attr('stroke-width', 0.7)
          .style('filter', null);
        setTooltip(null);
        onRegionHover?.(null);
      })
      .on('click', (_evt, d: any) => {
        const name = d.properties.NAME_2 || d.properties.dist_nm || '';
        onRegionHover?.(getRegionData(name, layer, selectedState ?? undefined));
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState, filteredDistricts, selectedState]);

  /* ── Back to India ───────────────────────────────────── */
  const handleBack = useCallback(() => {
    if (isTransitioning || !svgRef.current || !zoomRef.current || !gRef.current || !stateData) return;
    setIsTransitioning(true);
    setTooltip(null);

    const svg  = d3.select(svgRef.current);
    const zoom = zoomRef.current;
    const g    = gRef.current;

    svg.transition()
      .duration(1100)
      .ease(d3.easeCubicInOut)
      .call(zoom.transform, d3.zoomIdentity)
      .on('end', () => {
        setViewState('india');
        setSelectedState(null);
        setIsTransitioning(false);
        onRegionHover?.(null);
        drawStates(svg, g, zoom);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning, stateData, colourFor]);

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className={`india-map-container${isTransitioning ? ' map-transition-blur' : ''}`}>

      {/* Breadcrumb / Back nav */}
      <AnimatePresence>
        {viewState === 'state' && (
          <motion.div
            className="map-breadcrumb"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="map-breadcrumb-trail">
              <span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} onClick={handleBack}>
                India
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span>{selectedState}</span>
            </div>
            <button className="map-back-btn" onClick={handleBack} disabled={isTransitioning}>
              <ChevronLeft size={12} />
              Back to India
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="india-map-svg"
      />

      {/* Tooltip — tracks mouse, clamped to viewport */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.data.district || tooltip.data.state}
            className="map-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.92,    y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="map-tooltip-name">
              {tooltip.data.district || tooltip.data.state}
            </div>
            <div className="map-tooltip-value">{tooltip.data.value}</div>
            <div
              className="map-tooltip-comparison"
              style={{ color: tooltip.data.trend === 'up' ? '#22c55e' : tooltip.data.trend === 'down' ? '#ef4444' : '#94a3b8' }}
            >
              {tooltip.data.comparison}
            </div>
            <div className="map-tooltip-sep" />
            <div className="map-tooltip-rec-label">
              <Lightbulb size={9} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              AI Recommendation
            </div>
            <div className="map-tooltip-rec-text">{tooltip.data.recommendation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {(statesLoading || (viewState === 'state' && districtsLoading)) && (
        <div className="map-loading-overlay">
          <div className="map-spinner" />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Compiling Intelligence
          </p>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
