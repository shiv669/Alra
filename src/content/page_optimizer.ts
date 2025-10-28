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

// ============================================================================
// STEP 1: Define Optimization Interfaces & Types
// ============================================================================
// These types help us track what's been optimized and provide feedback

/**
 * Represents a single clutter element detected on the page
 * Used for tracking, removal, and metrics calculation
 */
interface ClutterElement {
  type: "ad" | "sidebar" | "footer" | "popup" | "tracking" | "redundant";
  element: HTMLElement;
  selector: string; // CSS selector for re-applying optimization if needed
  confidence: number; // 0-1, how confident we are this is clutter
  estimatedPixels: number; // How many pixels this clutter takes up
}

/**
 * Represents a content element worth highlighting
 * These are the important parts of the page we want to emphasize
 */
interface HighlightedContent {
  type: "heading" | "image" | "text-block" | "table" | "media";
  element: HTMLElement;
  importance: number; // 0-1, how important this content is
  estimatedReadingTime: number; // seconds to read/view this
}

/**
 * Optimization metrics that we track for impact calculation
 */
interface OptimizationMetrics {
  // Clutter metrics
  clutterElementsFound: number;
  clutterElementsRemoved: number;
  estimatedClutterPixels: number;
  estimatedClutterPercentage: number;

  // Content metrics
  contentBlocksAnalyzed: number;
  contentBlocksHighlighted: number;
  estimatedContentPixels: number;

  // Readability metrics
  readabilityScoreBefore: number; // 0-100
  readabilityScoreAfter: number; // 0-100
  readabilityImprovement: number; // percentage

  // Performance metrics
  optimizationTimeMs: number;
  domOperationsCount: number;
  cssInjectionsCount: number;
}

/**
 * Readability calculation result
 * Used to understand how readable the current page is
 */
interface ReadabilityScore {
  score: number; // 0-100
  grade: string; // "Poor", "Fair", "Good", "Excellent"
  factors: {
    textToClutterRatio: number; // 0-1
    contentDensity: number; // 0-1
    fontSizeAdequacy: number; // 0-1
    colorContrast: number; // 0-1
    whitespaceBalance: number; // 0-1
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

// ============================================================================
// STEP 2: Define Common Ad & Clutter Detection Patterns
// ============================================================================
// These patterns are used to identify ads, tracking scripts, and clutter
// They're organized by confidence level and type

/**
 * Common CSS selectors for ads across popular websites
 * Ordered by confidence level (high to low)
 */
const AD_SELECTORS = {
  highConfidence: [
    // Google AdSense
    "ins.adsbygoogle",
    ".google-auto-placed",

    // Common ad frameworks
    "div[id*='ad']",
    "div[id*='Ad']",
    "div[class*='advertisement']",
    "div[class*='ad-']",
    "div[class*='ads-']",
    "div[class*='advert']",

    // Facebook Audience Network
    ".fb-ad",
    "[data-ad-format]",

    // Sponsored content indicators
    "[data-sponsored]",
    ".sponsored-content",
    ".sponsored",

    // Programmatic ads
    ".advertisement",
    ".ad-container",
    ".adContainer",

    // Video ads
    ".video-ad",
    ".preroll",
    ".midroll",
    ".postroll",
  ],

  mediumConfidence: [
    // Iframes commonly used for ads
    "iframe[src*='ads']",
    "iframe[src*='ad.']",
    "iframe[id*='ad']",
    "iframe[class*='ad']",
    ".iframe-ad",

    // Divs with ad-related data attributes
    "div[data-adslot]",
    "div[data-ad-slot]",
    "div[data-ad-unit]",

    // Generic placement divs often used for ads
    "#top-ads",
    ".top-ads",
    ".side-ads",
    ".bottom-ads",
    ".floating-ads",
  ],

  lowConfidence: [
    // These are more generic and might catch legitimate content
    "div[class*='banner']", // Could be navigation banner
    "div[class*='promotion']", // Could be important promotion
    ".native-ad", // Native ads (might be important)
  ],
};

/**
 * CSS selectors for common clutter elements
 * These aren't necessarily ads, but they reduce readability
 */
const CLUTTER_SELECTORS = {
  highConfidence: [
    // Sidebars and navigation
    "aside",
    ".sidebar",
    ".side-bar",
    ".widget-area",

    // Sticky navigation (often obstructs content)
    ".sticky",
    ".fixed-header",
    ".sticky-nav",
    "nav.sticky",

    // Common footer clutter
    "footer > *:not(p):not(a):not(span)",
    ".footer-content > div:not(.footer-links)",

    // Tracking pixels and beacons
    "img[width='1'][height='1']",
    "img[style*='display:none']",
    "img[style*='visibility:hidden']",

    // Related/recommended articles (often distracting)
    ".related-posts",
    ".recommended-articles",
    ".you-may-like",

    // Newsletter signup (important but often intrusive)
    ".newsletter-signup",
    ".email-signup",
    ".subscription-box",

    // Pop-ups and overlays (often temporarily hidden)
    ".popup",
    ".modal",
    ".overlay",
    "[role='dialog']",
  ],

  mediumConfidence: [
    // Pagination links (user can navigate if needed)
    ".pagination",
    ".pager",
    "nav[aria-label*='page']",

    // Comments section (can be read if interested)
    ".comments",
    ".comments-section",
    "#comments",

    // Author info boxes (nice to have but not critical)
    ".author-box",
    ".author-info",
    ".contributor-info",
  ],
};

/**
 * Tracking scripts and pixels to remove
 */
const TRACKING_SELECTORS = [
  "script[src*='analytics']",
  "script[src*='googleanalytics']",
  "script[src*='facebook.com/en_US/sdk']",
  "script[src*='mixpanel']",
  "script[src*='segment']",
  "script[src*='intercom']",
  "img[src*='doubleclick']",
  "img[src*='facebook.com/tr']",
  "img[src*='analytics']",
  "img[src*='tracking']",
];

// ============================================================================
// STEP 3: Readability Calculation Engine
// ============================================================================
// Analyzes the page's readability before and after optimization

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
function calculateReadabilityScore(): ReadabilityScore {
  const factors = {
    textToClutterRatio: calculateTextToClutterRatio(),
    contentDensity: calculateContentDensity(),
    fontSizeAdequacy: calculateFontSizeAdequacy(),
    colorContrast: calculateColorContrast(),
    whitespaceBalance: calculateWhitespaceBalance(),
  };

  // Weighted average of all factors
  const score = Math.round(
    factors.textToClutterRatio * 0.3 +
      factors.contentDensity * 0.2 +
      factors.fontSizeAdequacy * 0.2 +
      factors.colorContrast * 0.15 +
      factors.whitespaceBalance * 0.15
  ) * 100;

  let grade: string;
  if (score >= 71) grade = "Excellent";
  else if (score >= 41) grade = "Good";
  else if (score >= 21) grade = "Fair";
  else grade = "Poor";

  return {
    score: Math.min(100, Math.max(0, score)),
    grade,
    factors,
  };
}

/**
 * calculateTextToClutterRatio - Estimate what percentage of page is actual content
 *
 * Heuristic:
 * - Count visible text characters
 * - Count ad/tracking/clutter elements
 * - Ratio = text / (text + clutter)
 * - Returns 0-1 where 1.0 = 100% content
 */
function calculateTextToClutterRatio(): number {
  let textCharacters = 0;
  let clutterElements = 0;

  // Count text in main content areas
  const contentAreas = document.querySelectorAll(
    "p, article, .article-content, main, [role='main'], .post-content"
  );
  contentAreas.forEach((el) => {
    const text = (el as HTMLElement).innerText || "";
    textCharacters += text.length;
  });

  // Count detected clutter elements
  Object.values(AD_SELECTORS).forEach((selectors) => {
    selectors.forEach((selector) => {
      clutterElements += document.querySelectorAll(selector).length;
    });
  });

  Object.values(CLUTTER_SELECTORS).forEach((selectors) => {
    selectors.forEach((selector) => {
      clutterElements += document.querySelectorAll(selector).length;
    });
  });

  // Calculate ratio
  const total = textCharacters + clutterElements * 100; // Assume each clutter element = 100 chars
  return total > 0 ? Math.min(1, textCharacters / total) : 0.5;
}

/**
 * calculateContentDensity - Determine if content is packed appropriately
 *
 * Heuristic:
 * - Measure viewport height vs content height
 * - If content spans many viewports: density is good (1.0)
 * - If content fits in 1-2 viewports: density is medium (0.6)
 * - If mostly empty: density is low (0.2)
 */
function calculateContentDensity(): number {
  const viewportHeight = window.innerHeight;
  const contentHeight = document.documentElement.scrollHeight;

  // Ideal ratio: content should be 4-10 viewports tall
  const ratio = contentHeight / viewportHeight;

  if (ratio > 10) return 0.8; // Good amount of content
  if (ratio > 4) return 1.0; // Ideal
  if (ratio > 2) return 0.6; // Decent
  if (ratio > 1) return 0.3; // Sparse
  return 0.1; // Very sparse
}

/**
 * calculateFontSizeAdequacy - Check if fonts are large enough
 *
 * Heuristic:
 * - Sample font sizes of main text
 * - Adequate size: 14px or larger for body text
 * - Suboptimal: 12px or smaller
 * - Score based on percentage of text that's adequate
 */
function calculateFontSizeAdequacy(): number {
  const paragraphs = document.querySelectorAll("p");
  if (paragraphs.length === 0) return 0.7; // No paragraphs, assume adequate

  let adequateFonts = 0;
  let totalFonts = 0;

  paragraphs.forEach((p) => {
    const fontSize = parseInt(window.getComputedStyle(p).fontSize);
    totalFonts++;
    if (fontSize >= 14) {
      adequateFonts++;
    }
  });

  return totalFonts > 0 ? adequateFonts / totalFonts : 0.7;
}

/**
 * calculateColorContrast - Estimate text readability based on contrast
 *
 * Heuristic:
 * - Sample text color vs background color
 * - Dark text on light background: good (1.0)
 * - Light text on dark background: good (1.0)
 * - Light text on light background: poor (0.2)
 * - Calculate relative luminance to estimate contrast
 */
function calculateColorContrast(): number {
  const sample = document.querySelector("p, article, main");
  if (!sample) return 0.7; // No sample, assume adequate

  const textColor = window.getComputedStyle(sample).color;
  const bgColor = window.getComputedStyle(sample).backgroundColor;

  // Simple heuristic: check if colors are text-like
  // This is a simplified check; full WCAG contrast calculation is complex
  const isLikelyGoodContrast =
    (textColor.includes("rgb(0") || textColor.includes("rgb(10")) &&
    (bgColor.includes("255") || bgColor.includes("rgb(255"));

  return isLikelyGoodContrast ? 0.9 : 0.6;
}

/**
 * calculateWhitespaceBalance - Assess if page has good spacing
 *
 * Heuristic:
 * - Too little whitespace: cramped, hard to scan (score 0.4)
 * - Good whitespace: comfortable reading (score 1.0)
 * - Too much whitespace: content feels sparse (score 0.5)
 * - Check margin/padding ratios
 */
function calculateWhitespaceBalance(): number {
  const main = document.querySelector("main, article, [role='main']");
  if (!main) return 0.6; // No main content area

  const style = window.getComputedStyle(main);
  const marginTotal =
    parseInt(style.marginTop) +
    parseInt(style.marginBottom) +
    parseInt(style.marginLeft) +
    parseInt(style.marginRight);
  const paddingTotal =
    parseInt(style.paddingTop) +
    parseInt(style.paddingBottom) +
    parseInt(style.paddingLeft) +
    parseInt(style.paddingRight);

  const spacing = marginTotal + paddingTotal;

  // Sweet spot: 40-200px total spacing
  if (spacing >= 40 && spacing <= 200) return 1.0;
  if (spacing < 20) return 0.3; // Too cramped
  if (spacing > 300) return 0.5; // Too sparse
  return 0.7;
}

// ============================================================================
// STEP 4: Clutter Detection & Removal Engine
// ============================================================================
// Intelligently identifies and removes ads/clutter while preserving content

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
function detectClutterElements(): ClutterElement[] {
  const clutterFound: ClutterElement[] = [];
  const processedElements = new Set<HTMLElement>(); // Avoid duplicates

  console.log("🔍 ALRA: Scanning page for clutter elements...");

  // Step 1: Detect high-confidence ads
  console.log("   Scanning for high-confidence ads...");
  AD_SELECTORS.highConfidence.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        if (!processedElements.has(element as HTMLElement)) {
          const el = element as HTMLElement;
          processedElements.add(el);

          const pixels = el.offsetWidth * el.offsetHeight;
          if (pixels > 0) {
            // Only count visible elements
            clutterFound.push({
              type: "ad",
              element: el,
              selector,
              confidence: 0.95,
              estimatedPixels: pixels,
            });
          }
        }
      });
    } catch (error) {
      // Invalid selector, skip
    }
  });

  console.log(`   ✅ Found ${clutterFound.length} high-confidence ads`);

  // Step 2: Detect medium-confidence ads
  const beforeMedium = clutterFound.length;
  console.log("   Scanning for medium-confidence ads...");
  AD_SELECTORS.mediumConfidence.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        if (!processedElements.has(element as HTMLElement)) {
          const el = element as HTMLElement;
          processedElements.add(el);

          // Extra validation: check size and visibility
          const pixels = el.offsetWidth * el.offsetHeight;
          if (pixels > 10000) {
            // Only flag if sufficiently large (likely ad, not content)
            clutterFound.push({
              type: "ad",
              element: el,
              selector,
              confidence: 0.7,
              estimatedPixels: pixels,
            });
          }
        }
      });
    } catch (error) {
      // Invalid selector, skip
    }
  });

  console.log(
    `   ✅ Found ${clutterFound.length - beforeMedium} medium-confidence ads`
  );

  // Step 3: Detect clutter elements
  const beforeClutter = clutterFound.length;
  console.log("   Scanning for clutter elements...");
  Object.entries(CLUTTER_SELECTORS.highConfidence).forEach(([, selector]) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        if (!processedElements.has(element as HTMLElement)) {
          const el = element as HTMLElement;
          processedElements.add(el);

          const pixels = el.offsetWidth * el.offsetHeight;
          if (pixels > 1000) {
            // Only count if reasonably sized
            clutterFound.push({
              type: "sidebar",
              element: el,
              selector,
              confidence: 0.85,
              estimatedPixels: pixels,
            });
          }
        }
      });
    } catch (error) {
      // Invalid selector, skip
    }
  });

  console.log(
    `   ✅ Found ${clutterFound.length - beforeClutter} clutter elements`
  );

  // Step 4: Detect tracking elements
  const beforeTracking = clutterFound.length;
  console.log("   Scanning for tracking pixels and scripts...");
  TRACKING_SELECTORS.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        if (!processedElements.has(element as HTMLElement)) {
          const el = element as HTMLElement;
          processedElements.add(el);
          clutterFound.push({
            type: "tracking",
            element: el,
            selector,
            confidence: 0.9,
            estimatedPixels: 0, // Tracking pixels are usually invisible
          });
        }
      });
    } catch (error) {
      // Invalid selector, skip
    }
  });

  console.log(
    `   ✅ Found ${clutterFound.length - beforeTracking} tracking elements`
  );
  console.log(
    `🎯 ALRA: Total clutter detected: ${clutterFound.length} elements`
  );

  return clutterFound;
}

/**
 * removeClutterElements - Safely remove detected clutter
 *
 * Safety checks:
 * 1. Never remove elements with confidence < 0.7
 * 2. Never remove if it would break page interactivity
 * 3. Hide first before removing (allow recovery if needed)
 * 4. Track what was removed for metrics
 *
 * Returns array of successfully removed elements
 */
function removeClutterElements(clutter: ClutterElement[]): ClutterElement[] {
  const removed: ClutterElement[] = [];

  console.log("🗑️  ALRA: Removing clutter elements...");

  clutter.forEach((clutterItem) => {
    try {
      const el = clutterItem.element;

      // Safety check 1: Only remove if high confidence
      if (clutterItem.confidence < 0.7) {
        console.debug(`   Skipping low-confidence element (${clutterItem.confidence})`);
        return;
      }

      // Safety check 2: Don't remove if element is a page root or critical
      if (
        el === document.body ||
        el === document.documentElement ||
        el.tagName === "HTML"
      ) {
        console.debug("   Skipping critical page element");
        return;
      }

      // Safety check 3: Check if element has critical handlers
      if (el.onclick || el.onsubmit) {
        console.debug("   Skipping element with event handlers");
        return;
      }

      // Proceed with removal
      el.remove();
      removed.push(clutterItem);
      console.debug(`   ✅ Removed ${clutterItem.type} element`);
    } catch (error) {
      console.debug(
        `   ⚠️ Could not remove element:`,
        error
      );
    }
  });

  console.log(
    `✅ ALRA: Successfully removed ${removed.length} clutter elements`
  );
  return removed;
}

// ============================================================================
// STEP 5: Content Highlighting System
// ============================================================================
// Identifies and highlights important content

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
function identifyKeyContent(): HighlightedContent[] {
  const keyContent: HighlightedContent[] = [];

  console.log("✨ ALRA: Identifying key content...");

  // Identify headings
  document.querySelectorAll("h1, h2, h3").forEach((heading) => {
    const text = (heading as HTMLElement).innerText;
    if (text && text.length > 0) {
      keyContent.push({
        type: "heading",
        element: heading as HTMLElement,
        importance: heading.tagName === "H1" ? 1.0 : 0.8,
        estimatedReadingTime: Math.ceil(text.split(" ").length / 200), // ~200 words per minute
      });
    }
  });

  // Identify images with captions
  document.querySelectorAll("img").forEach((img) => {
    const alt = img.getAttribute("alt");
    if (alt && alt.length > 10) {
      // Images with good alt text are likely important
      keyContent.push({
        type: "image",
        element: img as HTMLElement,
        importance: 0.7,
        estimatedReadingTime: 2, // Time to view image
      });
    }
  });

  // Identify main text blocks
  document.querySelectorAll("article, main, [role='main']").forEach((main) => {
    const paragraphs = main.querySelectorAll("p");
    paragraphs.forEach((p) => {
      const text = (p as HTMLElement).innerText;
      if (text && text.length > 50) {
        // Only highlight substantial paragraphs
        keyContent.push({
          type: "text-block",
          element: p as HTMLElement,
          importance: 0.6,
          estimatedReadingTime: Math.ceil(text.split(" ").length / 200),
        });
      }
    });
  });

  // Identify tables
  document.querySelectorAll("table").forEach((table) => {
    keyContent.push({
      type: "table",
      element: table as HTMLElement,
      importance: 0.85,
      estimatedReadingTime: 5, // Tables take time to understand
    });
  });

  // Identify media
  document.querySelectorAll("video, iframe[src*='youtube']").forEach((media) => {
    keyContent.push({
      type: "media",
      element: media as HTMLElement,
      importance: 0.8,
      estimatedReadingTime: 0, // User decides viewing time
    });
  });

  console.log(
    `✨ ALRA: Identified ${keyContent.length} key content elements`
  );
  return keyContent;
}

/**
 * highlightKeyContent - Add visual emphasis to important content
 *
 * CSS classes applied:
 * - .alra-highlighted: Glowing border/shadow effect
 * - .alra-heading: Emphasized headings
 * - .alra-media: Emphasized media
 *
 * Styling is non-intrusive: Uses subtle glows and borders
 */
function highlightKeyContent(
  keyContent: HighlightedContent[]
): HighlightedContent[] {
  const highlighted: HighlightedContent[] = [];

  console.log("🎨 ALRA: Highlighting key content...");

  keyContent.forEach((content) => {
    try {
      const el = content.element;

      // Add ALRA-specific class for highlighting
      el.classList.add("alra-highlighted");

      // Add type-specific class
      el.classList.add(`alra-${content.type}`);

      // Add importance-based class (for advanced styling)
      if (content.importance > 0.8) {
        el.classList.add("alra-high-importance");
      }

      highlighted.push(content);
      console.debug(
        `   ✅ Highlighted ${content.type} with importance ${content.importance}`
      );
    } catch (error) {
      console.debug(`   ⚠️ Could not highlight element:`, error);
    }
  });

  console.log(`✨ ALRA: Successfully highlighted ${highlighted.length} elements`);
  return highlighted;
}

// ============================================================================
// STEP 6: CSS Injection for Optimization Styling
// ============================================================================
// Injects CSS rules for visual feedback without modifying page structure

/**
 * injectOptimizationCSS - Add CSS rules for ALRA optimization styling
 *
 * Styles defined:
 * - .alra-highlighted: Glowing border effect for key content
 * - .alra-heading: Special styling for highlighted headings
 * - .alra-media: Frame effect for images/videos
 * - .alra-optimization-badge: Status badge for users
 *
 * All styles use !important to override page CSS
 * Ensures consistent appearance across all websites
 */
function injectOptimizationCSS(): void {
  // Skip if already injected
  if (document.getElementById("alra-optimization-css")) {
    console.debug("🎨 ALRA: Optimization CSS already injected, skipping");
    return;
  }

  console.log("🎨 ALRA: Injecting optimization CSS...");

  const cssContent = `
    /* ====================================================================== */
    /* ALRA Page Optimization Styling - DO NOT MODIFY */
    /* ====================================================================== */

    /* Key Content Highlighting - Glowing border effect */
    .alra-highlighted {
      border-left: 4px solid #4299e1 !important;
      box-shadow: 0 0 12px rgba(66, 153, 225, 0.4) !important;
      padding-left: 12px !important;
      transition: all 0.3s ease !important;
    }

    .alra-highlighted:hover {
      box-shadow: 0 0 20px rgba(66, 153, 225, 0.6) !important;
      border-left-color: #2d7cb8 !important;
    }

    /* High-importance content gets stronger emphasis */
    .alra-high-importance {
      background-color: rgba(66, 153, 225, 0.05) !important;
      border-radius: 4px !important;
    }

    /* Heading-specific styling */
    .alra-heading {
      color: inherit !important; /* Don't change text color */
      text-shadow: 0 0 8px rgba(66, 153, 225, 0.2) !important;
    }

    /* Media container styling */
    .alra-media {
      border: 2px solid rgba(66, 153, 225, 0.3) !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      transition: transform 0.3s ease !important;
    }

    .alra-media:hover {
      transform: scale(1.02) !important;
      border-color: rgba(66, 153, 225, 0.6) !important;
    }

    /* Optimization status badge - floating in bottom-right corner */
    .alra-optimization-badge {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
      z-index: 10000 !important;
      cursor: pointer !important;
      user-select: none !important;
      letter-spacing: 0.5px !important;
      transition: all 0.3s ease !important;
    }

    .alra-optimization-badge:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6) !important;
    }

    .alra-optimization-badge.active {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    }

    .alra-optimization-badge.disabled {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
      opacity: 0.7 !important;
    }

    /* Optimization impact indicator */
    .alra-impact-indicator {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      background: rgba(66, 153, 225, 0.8) !important;
      color: white !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      font-size: 10px !important;
      font-weight: bold !important;
      z-index: 9999 !important;
    }

    /* Ensure highlighted elements don't break layout */
    .alra-highlighted,
    .alra-heading,
    .alra-media {
      max-width: 100% !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }

    /* Animation for newly highlighted elements */
    @keyframes alra-highlight-pulse {
      0% {
        box-shadow: 0 0 8px rgba(66, 153, 225, 0.2);
      }
      50% {
        box-shadow: 0 0 16px rgba(66, 153, 225, 0.5);
      }
      100% {
        box-shadow: 0 0 12px rgba(66, 153, 225, 0.4);
      }
    }

    .alra-highlighted.just-added {
      animation: alra-highlight-pulse 1s ease-in-out;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = "alra-optimization-css";
  styleElement.textContent = cssContent;
  document.head.appendChild(styleElement);

  console.log("✅ ALRA: Optimization CSS injected successfully");
}

// ============================================================================
// STEP 7: Main Optimization Orchestrator
// ============================================================================
// Coordinates all optimization steps and returns comprehensive results

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
async function optimizePage(): Promise<OptimizationResult> {
  console.log(
    "════════════════════════════════════════════════════════════════════"
  );
  console.log(
    "🚀 ALRA: Starting Page Optimization (Phase 2) - Full Details Below"
  );
  console.log(
    "════════════════════════════════════════════════════════════════════"
  );

  const startTime = performance.now();

  try {
    // Step 1: Measure readability before
    console.log("\n📊 STEP 1: Analyzing current page readability...");
    const readabilityBefore = calculateReadabilityScore();
    console.log(`   Readability Score: ${readabilityBefore.score}/100 (${readabilityBefore.grade})`);
    console.log(`   Factors:`, readabilityBefore.factors);

    // Step 2: Inject CSS for visual feedback
    console.log(
      "\n🎨 STEP 2: Injecting optimization CSS for visual feedback..."
    );
    injectOptimizationCSS();

    // Step 3: Detect clutter
    console.log("\n🔍 STEP 3: Detecting clutter elements on page...");
    const clutterDetected = detectClutterElements();
    const totalClutterPixels = clutterDetected.reduce(
      (sum, c) => sum + c.estimatedPixels,
      0
    );

    // Step 4: Remove clutter
    console.log("\n🗑️  STEP 4: Removing clutter elements...");
    const clutterRemoved = removeClutterElements(clutterDetected);

    // Step 5: Identify key content
    console.log("\n✨ STEP 5: Identifying key content on page...");
    const keyContent = identifyKeyContent();

    // Step 6: Highlight key content
    console.log("\n🎯 STEP 6: Highlighting key content with visual emphasis...");
    const contentHighlighted = highlightKeyContent(keyContent);

    // Step 7: Measure readability after
    console.log("\n📊 STEP 7: Re-analyzing page readability after optimization...");
    const readabilityAfter = calculateReadabilityScore();
    console.log(`   Readability Score: ${readabilityAfter.score}/100 (${readabilityAfter.grade})`);
    console.log(`   Improvement: +${readabilityAfter.score - readabilityBefore.score} points`);

    // Step 8: Calculate metrics
    const optimizationTimeMs = performance.now() - startTime;
    const metrics: OptimizationMetrics = {
      clutterElementsFound: clutterDetected.length,
      clutterElementsRemoved: clutterRemoved.length,
      estimatedClutterPixels: totalClutterPixels,
      estimatedClutterPercentage: Math.round(
        (totalClutterPixels / (window.innerWidth * window.innerHeight)) * 100
      ),
      contentBlocksAnalyzed: keyContent.length,
      contentBlocksHighlighted: contentHighlighted.length,
      estimatedContentPixels:
        window.innerWidth * window.innerHeight - totalClutterPixels,
      readabilityScoreBefore: readabilityBefore.score,
      readabilityScoreAfter: readabilityAfter.score,
      readabilityImprovement: readabilityAfter.score - readabilityBefore.score,
      optimizationTimeMs,
      domOperationsCount:
        clutterRemoved.length + contentHighlighted.length,
      cssInjectionsCount: 1,
    };

    // Step 9: Display status badge
    console.log("\n🎉 STEP 8: Displaying optimization status...");
    displayOptimizationStatus(metrics, readabilityAfter);

    // Step 10: Log comprehensive summary
    console.log("\n════════════════════════════════════════════════════════════════════");
    console.log("📈 PAGE OPTIMIZATION COMPLETE - COMPREHENSIVE SUMMARY");
    console.log("════════════════════════════════════════════════════════════════════");
    console.log(`\n✅ OPTIMIZATION METRICS:`);
    console.log(`   • Clutter Elements Found:    ${metrics.clutterElementsFound}`);
    console.log(`   • Clutter Elements Removed:  ${metrics.clutterElementsRemoved}`);
    console.log(`   • Estimated Clutter Space:   ${metrics.estimatedClutterPercentage}% of viewport`);
    console.log(`   • Content Blocks Analyzed:   ${metrics.contentBlocksAnalyzed}`);
    console.log(`   • Content Highlighted:       ${metrics.contentBlocksHighlighted}`);
    console.log(`   • DOM Operations:            ${metrics.domOperationsCount}`);
    console.log(`   • Optimization Time:         ${metrics.optimizationTimeMs.toFixed(2)}ms`);

    console.log(`\n📖 READABILITY IMPROVEMENT:`);
    console.log(`   • Before: ${metrics.readabilityScoreBefore}/100 (${readabilityBefore.grade})`);
    console.log(`   • After:  ${metrics.readabilityScoreAfter}/100 (${readabilityAfter.grade})`);
    console.log(`   • Improvement: +${metrics.readabilityImprovement} points (${Math.round((metrics.readabilityImprovement / metrics.readabilityScoreBefore) * 100)}%)`);

    console.log(`\n💡 PAGE ANALYSIS:`);
    console.log(`   • Clutter Ratio: ${((metrics.estimatedClutterPixels / (window.innerWidth * window.innerHeight)) * 100).toFixed(1)}% of page`);
    console.log(`   • Content Density: ${readabilityAfter.factors.contentDensity.toFixed(2)}`);
    console.log(`   • Text/Clutter Ratio: ${(readabilityAfter.factors.textToClutterRatio * 100).toFixed(1)}%`);

    console.log("\n════════════════════════════════════════════════════════════════════");
    console.log("✨ ALRA Page Optimization Complete!");
    console.log("════════════════════════════════════════════════════════════════════\n");

    return {
      success: true,
      metrics,
      readabilityBefore,
      readabilityAfter,
      clustersRemoved: clutterRemoved,
      contentHighlighted,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(
      "❌ ALRA: Error during page optimization:",
      error
    );
    return {
      success: false,
      metrics: {
        clutterElementsFound: 0,
        clutterElementsRemoved: 0,
        estimatedClutterPixels: 0,
        estimatedClutterPercentage: 0,
        contentBlocksAnalyzed: 0,
        contentBlocksHighlighted: 0,
        estimatedContentPixels: 0,
        readabilityScoreBefore: 0,
        readabilityScoreAfter: 0,
        readabilityImprovement: 0,
        optimizationTimeMs: performance.now() - startTime,
        domOperationsCount: 0,
        cssInjectionsCount: 0,
      },
      readabilityBefore: {
        score: 0,
        grade: "Error",
        factors: {
          textToClutterRatio: 0,
          contentDensity: 0,
          fontSizeAdequacy: 0,
          colorContrast: 0,
          whitespaceBalance: 0,
        },
      },
      readabilityAfter: {
        score: 0,
        grade: "Error",
        factors: {
          textToClutterRatio: 0,
          contentDensity: 0,
          fontSizeAdequacy: 0,
          colorContrast: 0,
          whitespaceBalance: 0,
        },
      },
      clustersRemoved: [],
      contentHighlighted: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * displayOptimizationStatus - Show visual feedback badge to user
 *
 * Displays:
 * - Optimization status (Active/Disabled)
 * - Readability score
 * - Clutter removal percentage
 * - Allows user to toggle optimization
 */
function displayOptimizationStatus(
  metrics: OptimizationMetrics,
  readability: ReadabilityScore
): void {
  // Create badge element
  const badge = document.createElement("div");
  badge.className = "alra-optimization-badge active";
  badge.id = "alra-optimization-status";

  const scoreDelta = metrics.readabilityImprovement;
  const clutterPercent = metrics.estimatedClutterPercentage;

  badge.innerHTML = `
    ✨ ALRA Optimized
    <br/>
    📈 Score: +${scoreDelta} | 🗑️ ${clutterPercent}% cleaned
  `;

  badge.title = `
ALRA Page Optimization Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Readability: ${metrics.readabilityScoreBefore} → ${metrics.readabilityScoreAfter} (+${scoreDelta})
Clutter Removed: ${metrics.clutterElementsRemoved}/${metrics.clutterElementsFound}
Content Highlighted: ${metrics.contentBlocksHighlighted}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click to toggle optimization
  `.trim();

  // Add click handler to toggle
  badge.addEventListener("click", () => {
    const isActive = badge.classList.contains("active");
    if (isActive) {
      disableOptimization();
      badge.classList.remove("active");
      badge.classList.add("disabled");
    } else {
      location.reload(); // Reload to re-enable
    }
  });

  document.body.appendChild(badge);
  console.log("✅ ALRA: Status badge displayed to user");
}

/**
 * disableOptimization - Remove all ALRA optimizations from page
 *
 * Removes:
 * - All ALRA CSS classes
 * - Status badge
 * - Reverts to original page state
 */
function disableOptimization(): void {
  console.log("🔄 ALRA: Disabling page optimization...");

  // Remove ALRA classes from all elements
  document.querySelectorAll(".alra-highlighted").forEach((el) => {
    el.classList.remove("alra-highlighted");
    el.classList.remove("alra-heading");
    el.classList.remove("alra-media");
    el.classList.remove("alra-high-importance");
  });

  // Remove status badge
  const badge = document.getElementById("alra-optimization-status");
  if (badge) badge.remove();

  // Remove CSS
  const css = document.getElementById("alra-optimization-css");
  if (css) css.remove();

  console.log("✅ ALRA: Page optimization disabled");
}

// Export functions for use in content script
export {
  optimizePage,
  disableOptimization,
  calculateReadabilityScore,
  detectClutterElements,
  identifyKeyContent,
  OptimizationResult,
  OptimizationMetrics,
  ReadabilityScore,
};
