// svg_parser.ts
export interface SVGPathInfo {
    d: string;
    fill?: string;
}

export interface ParsedSVG {
    paths: SVGPathInfo[];
    viewBox: string;
}

export function parseSVGString(svgString: string): ParsedSVG {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) {
        throw new Error('No SVG element found');
    }

    // Get viewBox
    const viewBox = svg.getAttribute('viewBox') || '0 0 100 100';

    // Get all paths
    const pathElements = svg.querySelectorAll('path');
    const paths = Array.from(pathElements).map(path => ({
        d: path.getAttribute('d') || '',
        fill: path.getAttribute('fill') || undefined
    }));

    return {
        paths,
        viewBox
    };
}

export function combinePaths(paths: SVGPathInfo[]): string {
    return paths.map(p => p.d).join(' ');
}
