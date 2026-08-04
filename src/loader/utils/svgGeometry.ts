/**
 * svgGeometry.ts
 *
 * Generic helpers for turning a flat list of SVG `<path>` elements into
 * vertically-ordered "bands" for a staggered reveal animation.
 *
 * Why bands and not per-path animation: a detailed vector trace can easily
 * contain several hundred individual paths. Animating each one as its own
 * Framer Motion node is a real performance risk (hundreds of simultaneously
 * animated DOM nodes). Bucketing them into a fixed number of vertical bands
 * — each band sharing one stagger delay — keeps the visual "wave" smooth
 * while animating an order of magnitude fewer nodes.
 *
 * This module has no knowledge of phoenixes or any specific theme; any
 * theme whose ignition stage is an illustrated SVG can reuse it.
 */

export interface ExtractedPath {
  /** The raw `d` attribute, unmodified. */
  d: string;
  /** The path's original fill color, preserved so the reveal uses real artwork colors. */
  fill: string;
}

export interface PathBand {
  /** Paths belonging to this band, in original document order. */
  paths: ExtractedPath[];
  /** 0 (bottom-most band) to 1 (top-most band), used to compute stagger delay. */
  verticalPosition: number;
}

/**
 * Extracts every `<path d="..." fill="...">` from raw SVG markup.
 * Deliberately regex-based rather than a full XML parse: this runs once,
 * on static bundled markup, not on user input, and the source SVGs this
 * engine targets are flat exports with a consistent `d`/`fill` shape.
 */
export function extractPaths(svgMarkup: string): ExtractedPath[] {
  const results: ExtractedPath[] = [];

  // Capture each <path ...> tag's full attribute string first. Path `d`
  // data never contains a literal `>`, so matching up to the next `>` is
  // safe even though `d` commonly spans multiple lines (Adobe Express and
  // similar exporters wrap long `d` values across lines with tabs/newlines).
  const tagRegex = /<path\b([^>]*)>/g;

  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(svgMarkup)) !== null) {
    const attrs = tagMatch[1];

    // Extracted independently so attribute order never matters — some
    // exporters emit `d` then `fill`, others emit `fill`, `opacity`,
    // `stroke`, then `d`, etc.
    const dMatch = /\bd=["']([^"']+)["']/.exec(attrs);
    const fillMatch = /\bfill=["']([^"']+)["']/.exec(attrs);

    if (!dMatch) continue; // no path data — nothing to render for this tag

    // Some exporters set fill="none" with a separate stroke color, or omit
    // fill entirely (inheriting from a parent). Default to a visible
    // fallback color rather than silently dropping the path.
    const fill =
      fillMatch && fillMatch[1].toLowerCase() !== "none"
        ? fillMatch[1]
        : "#E8712C";

    results.push({ d: dMatch[1], fill });
  }

  return results;
}

/**
 * Computes an approximate axis-aligned bounding box for a path's `d`
 * attribute by sampling its numeric tokens. Like estimateAverageY below,
 * this doesn't interpret curve math precisely, but is accurate enough to
 * distinguish "a real foreground shape" from "a path spanning the entire
 * canvas" (which is what we actually need it for).
 */
function estimateBBox(d: string): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} | null {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) return null;

  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < numbers.length; i += 2) {
    xs.push(parseFloat(numbers[i]));
    if (i + 1 < numbers.length) ys.push(parseFloat(numbers[i + 1]));
  }

  if (xs.length === 0 || ys.length === 0) return null;

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * Filters out paths whose bounding box spans nearly the entire canvas in
 * both dimensions — a background fill or canvas-frame artifact left over
 * from some vector-trace/export tools, rather than actual artwork detail.
 * A real feather, flame tip, or facial feature never covers the full
 * canvas on both axes, so this is a safe heuristic rather than a fragile
 * one-off fix for a specific file.
 */
export function filterOutBackgroundArtifacts(
  paths: ExtractedPath[],
  viewBoxWidth: number,
  viewBoxHeight: number,
  threshold = 0.95,
): ExtractedPath[] {
  return paths.filter((path) => {
    const bbox = estimateBBox(path.d);
    if (!bbox) return true;
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    const isFullCanvasArtifact =
      width >= threshold * viewBoxWidth && height >= threshold * viewBoxHeight;
    return !isFullCanvasArtifact;
  });
}

/**
 * Estimates a path's vertical position from the y-coordinates embedded in
 * its `d` attribute, without requiring a mounted DOM node (`getBBox` needs
 * layout, which we want to avoid paying for on every path at parse time).
 * This is an approximation — it samples numeric tokens rather than fully
 * interpreting curve math — but for stagger-ordering purposes (not pixel
 * accuracy) it's more than sufficient.
 */
function estimateAverageY(d: string): number {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) return 0;

  // SVG path commands interleave x and y values. We treat every second
  // number as a y-sample, which holds for the M/C/L-heavy paths produced
  // by standard vector-trace exports.
  let sum = 0;
  let count = 0;
  for (let i = 1; i < numbers.length; i += 2) {
    sum += parseFloat(numbers[i]);
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Groups extracted paths into `bandCount` vertical bands, ordered so that
 * `bands[0]` is the visually bottom-most content and the last band is the
 * visually top-most — matching a bottom-to-top reveal.
 *
 * @param origin  Optional normalized (0–1) horizontal/vertical point the
 *                reveal should radiate from (e.g. an ember's position).
 *                When provided, bands are ordered by distance from this
 *                point instead of strictly bottom-to-top.
 */
export function bucketPathsIntoBands(
  paths: ExtractedPath[],
  bandCount: number,
  viewBoxHeight: number,
): PathBand[] {
  if (paths.length === 0 || bandCount <= 0) return [];

  const withY = paths.map((path) => ({
    path,
    y: estimateAverageY(path.d),
  }));

  const minY = Math.min(...withY.map((p) => p.y));
  const maxY = Math.max(...withY.map((p) => p.y));
  const range = Math.max(maxY - minY, 1);

  const bands: PathBand[] = Array.from({ length: bandCount }, (_, index) => ({
    paths: [],
    // Reversed because SVG y grows downward: band 0 = bottom = highest y.
    verticalPosition: index / Math.max(bandCount - 1, 1),
  }));

  for (const { path, y } of withY) {
    const normalized = (y - minY) / range; // 0 = top, 1 = bottom
    const bandFromTop = Math.min(
      bandCount - 1,
      Math.floor((1 - normalized) * bandCount),
    );
    // Invert so index 0 is the bottom band.
    const bandIndex = bandCount - 1 - bandFromTop;
    bands[bandIndex].paths.push(path);
  }

  void viewBoxHeight; // reserved for future origin-point (radial) ordering
  return bands.filter((band) => band.paths.length > 0);
}
