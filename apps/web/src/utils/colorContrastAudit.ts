/**
 * Color contrast audit utility for WCAG 2.1 AA compliance
 * Ensures all text meets minimum contrast ratios for accessibility
 */

// WCAG 2.1 AA Standards
const WCAG_AA_NORMAL_TEXT = 4.5; // 4.5:1 ratio for normal text
const WCAG_AA_LARGE_TEXT = 3.0;  // 3.0:1 ratio for large text (18pt+ or 14pt+ bold)
const WCAG_AAA_NORMAL_TEXT = 7.0; // 7:1 ratio for AAA compliance
const WCAG_AAA_LARGE_TEXT = 4.5;  // 4.5:1 ratio for AAA large text

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Calculate relative luminance according to WCAG
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(color1[0], color1[1], color1[2]);
  const lum2 = getLuminance(color2[0], color2[1], color2[2]);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Parse CSS color value to RGB
 */
function parseColor(color: string): [number, number, number] | null {
  // Remove whitespace
  color = color.trim();

  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]), 
      parseInt(rgbMatch[2]), 
      parseInt(rgbMatch[3])
    ];
  }

  // Handle hsl colors
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1]), 
      parseInt(hslMatch[2]), 
      parseInt(hslMatch[3])
    );
  }

  // Handle named colors (common ones)
  const namedColors: Record<string, [number, number, number]> = {
    'white': [255, 255, 255],
    'black': [0, 0, 0],
    'red': [255, 0, 0],
    'green': [0, 128, 0],
    'blue': [0, 0, 255],
    'gray': [128, 128, 128],
    'transparent': [0, 0, 0] // Treat as black for contrast calculation
  };

  return namedColors[color.toLowerCase()] || null;
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGStandards(
  ratio: number, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): { meets: boolean; required: number; level: string } {
  let required: number;
  
  if (level === 'AA') {
    required = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
  } else {
    required = isLargeText ? WCAG_AAA_LARGE_TEXT : WCAG_AAA_NORMAL_TEXT;
  }
  
  return {
    meets: ratio >= required,
    required,
    level: `WCAG ${level} ${isLargeText ? 'Large Text' : 'Normal Text'}`
  };
}

/**
 * Audit color combinations for accessibility compliance
 */
export interface ColorAuditResult {
  textColor: string;
  backgroundColor: string;
  contrastRatio: number;
  wcagAA: { meets: boolean; required: number; level: string };
  wcagAAA: { meets: boolean; required: number; level: string };
  recommendations: string[];
}

export function auditColorCombination(
  textColor: string, 
  backgroundColor: string,
  isLargeText: boolean = false
): ColorAuditResult | null {
  const textRgb = parseColor(textColor);
  const bgRgb = parseColor(backgroundColor);
  
  if (!textRgb || !bgRgb) {
    console.warn('Could not parse colors:', { textColor, backgroundColor });
    return null;
  }
  
  const ratio = calculateContrastRatio(textRgb, bgRgb);
  const wcagAA = meetsWCAGStandards(ratio, 'AA', isLargeText);
  const wcagAAA = meetsWCAGStandards(ratio, 'AAA', isLargeText);
  
  const recommendations: string[] = [];
  
  if (!wcagAA.meets) {
    recommendations.push(`Increase contrast ratio to at least ${wcagAA.required}:1 for WCAG AA compliance`);
    if (isLargeText) {
      recommendations.push('Consider using these colors only for large text (18pt+ or 14pt+ bold)');
    } else {
      recommendations.push('Consider making text larger (18pt+ or 14pt+ bold) to reduce contrast requirements');
    }
  } else if (!wcagAAA.meets) {
    recommendations.push(`For AAA compliance, increase contrast ratio to ${wcagAAA.required}:1`);
  }
  
  if (ratio < 2.0) {
    recommendations.push('⚠️ CRITICAL: Very low contrast - text may be completely unreadable');
  } else if (ratio < 3.0) {
    recommendations.push('⚠️ WARNING: Low contrast may cause readability issues');
  }
  
  return {
    textColor,
    backgroundColor,
    contrastRatio: Math.round(ratio * 100) / 100,
    wcagAA,
    wcagAAA,
    recommendations
  };
}

/**
 * Audit all color combinations used in Fixia theme
 */
export function auditFixiaTheme(): ColorAuditResult[] {
  const results: ColorAuditResult[] = [];
  
  // Common color combinations used in the app
  const combinations = [
    // Dark theme combinations
    { text: 'hsl(0, 0%, 98%)', bg: 'hsl(240, 10%, 3.9%)', desc: 'Main text on dark background' },
    { text: 'hsl(240, 5%, 64.9%)', bg: 'hsl(240, 10%, 3.9%)', desc: 'Muted text on dark background' },
    { text: 'hsl(0, 0%, 98%)', bg: '#667eea', desc: 'White text on primary button' },
    { text: 'hsl(0, 0%, 98%)', bg: 'hsl(0, 62.8%, 30.6%)', desc: 'White text on destructive background' },
    { text: 'hsl(0, 0%, 9%)', bg: '#ffd93d', desc: 'Dark text on warning background' },
    
    // Light theme combinations
    { text: 'rgba(10, 10, 11, 0.95)', bg: '#fafbfc', desc: 'Main text on light background' },
    { text: 'rgba(10, 10, 11, 0.6)', bg: '#fafbfc', desc: 'Muted text on light background' },
    { text: 'rgba(255, 255, 255, 0.98)', bg: '#667eea', desc: 'White text on primary (light theme)' },
    
    // Status colors
    { text: 'hsl(0, 0%, 98%)', bg: '#51cf66', desc: 'White text on success background' },
    { text: 'hsl(0, 0%, 98%)', bg: 'hsl(240, 3.7%, 15.9%)', desc: 'White text on secondary background' },
  ];
  
  combinations.forEach(combo => {
    const result = auditColorCombination(combo.text, combo.bg);
    if (result) {
      (result as any).description = combo.desc;
      results.push(result);
    }
  });
  
  return results;
}

/**
 * Run color contrast audit and log results (development only)
 */
export function runColorContrastAudit(): void {
  if (import.meta.env.PROD) {
    return; // Skip in production
  }
  
  console.group('🎨 Fixia Color Contrast Audit (WCAG 2.1)');
  
  const results = auditFixiaTheme();
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  
  results.forEach((result, index) => {
    const desc = (result as any).description || `Color combination ${index + 1}`;
    
    if (result.wcagAA.meets) {
      console.log(`✅ ${desc}:`);
      console.log(`   Ratio: ${result.contrastRatio}:1 (WCAG AA: ✅, AAA: ${result.wcagAAA.meets ? '✅' : '❌'})`);
      passCount++;
    } else {
      console.warn(`❌ ${desc}:`);
      console.warn(`   Ratio: ${result.contrastRatio}:1 (Required: ${result.wcagAA.required}:1)`);
      console.warn(`   Colors: ${result.textColor} on ${result.backgroundColor}`);
      result.recommendations.forEach(rec => console.warn(`   💡 ${rec}`));
      failCount++;
    }
    
    if (result.recommendations.some(r => r.includes('WARNING'))) {
      warnCount++;
    }
  });
  
  console.log(`\n📊 Audit Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
  
  if (failCount > 0) {
    console.warn(`⚠️ ${failCount} color combinations need attention for WCAG AA compliance`);
  } else {
    console.log('🎉 All color combinations meet WCAG AA standards!');
  }
  
  console.groupEnd();
}

// Auto-run audit in development
if (import.meta.env.DEV) {
  // Run audit after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runColorContrastAudit);
  } else {
    runColorContrastAudit();
  }
}