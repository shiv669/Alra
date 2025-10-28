/**
 * ALRA Page Optimizer Module (Phase 2)
 *
 * This module is responsible for real-time page optimization:
 * - Detecting and removing ads, clutter, and distractions
 * - Highlighting key content (headings, images, important text)
 * - Calculating readability metrics and optimization impact
 * - Providing visual feedback to the user
 * - Maintaining optimization state across page interactions
 *
 * Design Philosophy:
 * - Non-invasive: Preserves page functionality and user intent
 * - Reversible: All changes can be undone if user disables optimization
 * - Intelligent: Uses heuristics to identify true clutter vs important content
 * - Measurable: Tracks optimization metrics for impact calculation
 * - Fast: Minimal DOM operations, cached selectors, efficient algorithms
 *
 * Think of this as ALRA's "cleanup crew" that makes every webpage readable and distraction-free
 */
/**
 * Represents a single clutter element detected on the page
 * Used for tracking, removal, and metrics calculation
 */
interface ClutterElement {
    type: "ad" | "sidebar" | "footer" | "popup" | "tracking" | "redundant";
    element: HTMLElement;
    selector: string;
    confidence: number;
    estimatedPixels: number;
}
/**
 * Represents a content element worth highlighting
 * These are the important parts of the page we want to emphasize
 */
interface HighlightedContent {
    type: "heading" | "image" | "text-block" | "table" | "media";
    element: HTMLElement;
    importance: number;
    estimatedReadingTime: number;
}
/**
 * Optimization metrics that we track for impact calculation
 */
interface OptimizationMetrics {
    clutterElementsFound: number;
    clutterElementsRemoved: number;
    estimatedClutterPixels: number;
    estimatedClutterPercentage: number;
    contentBlocksAnalyzed: number;
    contentBlocksHighlighted: number;
    estimatedContentPixels: number;
    readabilityScoreBefore: number;
    readabilityScoreAfter: number;
    readabilityImprovement: number;
    optimizationTimeMs: number;
    domOperationsCount: number;
    cssInjectionsCount: number;
}
/**
 * Readability calculation result
 * Used to understand how readable the current page is
 */
interface ReadabilityScore {
    score: number;
    grade: string;
    factors: {
        textToClutterRatio: number;
        contentDensity: number;
        fontSizeAdequacy: number;
        colorContrast: number;
        whitespaceBalance: number;
    };
}
/**
 * Optimization result returned to caller
 * Contains all information about what was optimized
 */
interface OptimizationResult {
    success: boolean;
    metrics: OptimizationMetrics;
    readabilityBefore: ReadabilityScore;
    readabilityAfter: ReadabilityScore;
    clustersRemoved: ClutterElement[];
    contentHighlighted: HighlightedContent[];
    timestamp: number;
}
/**
 * calculateReadabilityScore - Analyze page readability
 *
 * This function evaluates:
 * - Text-to-clutter ratio (what % is actual content vs noise)
 * - Content density (is content packed or spread out well)
 * - Font size adequacy (are fonts large enough to read)
 * - Color contrast (can user read the text)
 * - Whitespace balance (is page too cramped or too sparse)
 *
 * Returns a score from 0-100 where:
 * 0-20: Poor (very hard to read)
 * 21-40: Fair (somewhat readable)
 * 41-70: Good (readable but not optimal)
 * 71-100: Excellent (very readable)
 */
declare function calculateReadabilityScore(): ReadabilityScore;
/**
 * detectClutterElements - Scan page and identify clutter
 *
 * Uses progressive confidence levels:
 * 1. Start with high-confidence patterns (definitely ads/clutter)
 * 2. Add medium-confidence patterns (likely ads/clutter)
 * 3. Skip low-confidence patterns initially (might be legitimate content)
 *
 * Returns array of detected clutter elements with confidence scores
 */
declare function detectClutterElements(): ClutterElement[];
/**
 * identifyKeyContent - Find the most important content on the page
 *
 * Importance scoring:
 * - Headings: High importance (structure and topic indicators)
 * - Images: Medium-high importance (visual content)
 * - Main text blocks: Medium importance (body content)
 * - Tables: High importance (structured data)
 * - Media: High importance (videos, interactive content)
 *
 * Returns array of highlighted content elements
 */
declare function identifyKeyContent(): HighlightedContent[];
/**
 * optimizePage - Main entry point for page optimization
 *
 * Orchestration flow:
 * 1. Calculate readability BEFORE optimization
 * 2. Inject CSS for visual feedback
 * 3. Detect clutter elements
 * 4. Remove clutter
 * 5. Identify key content
 * 6. Highlight key content
 * 7. Calculate readability AFTER optimization
 * 8. Generate metrics
 * 9. Display status to user
 * 10. Return comprehensive results
 *
 * This function is the main public API for page optimization
 */
declare function optimizePage(): Promise<OptimizationResult>;
/**
 * disableOptimization - Remove all ALRA optimizations from page
 *
 * Removes:
 * - All ALRA CSS classes
 * - Status badge
 * - Reverts to original page state
 */
declare function disableOptimization(): void;
export { optimizePage, disableOptimization, calculateReadabilityScore, detectClutterElements, identifyKeyContent, OptimizationResult, OptimizationMetrics, ReadabilityScore, };
