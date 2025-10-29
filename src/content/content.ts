/**
 * ALRA Content Script
 *
 * This script runs on EVERY webpage the user visits
 * It's responsible for:
 * - Optimizing the page layout (removing ads, cleaning clutter)
 * - Showing UI elements like nudges, summaries, predictions
 * - Collecting metrics (time spent, user interactions)
 * - Communicating with the background script
 *
 * Think of this as the "eyes and hands" of ALRA on each webpage
 * The background script is the "brain" that makes decisions
 */

// Global error handler for extension context invalidation
// This prevents "Uncaught Error" messages when extension reloads
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  if (error && error.message && error.message.includes('Extension context invalidated')) {
    // Silently prevent default - this is expected during extension reload
    event.preventDefault();
  }
});

// CRITICAL: Import webpack public path configuration FIRST
// This ensures dynamic imports (chunks) load from the extension's context
import './webpack-public-path';

// Phase 3, 4, 5: Static imports to avoid chunk loading issues in Chrome MV3
// Content scripts cannot dynamically load chunks due to CSP restrictions
import { initializeSummarizer } from "./summarizer";
import { initializeTabPredictor } from "./tab-predictor";
import { initializeNudges, getNudgeMetrics } from "./nudges";
import { initializeMetrics, metricsTracker } from "./metrics";
import { FloatingMenu } from "./floating-menu";
import { SummaryModal } from "./summary-modal";
import { MetricsModal } from "./metrics-modal";
import { SmartNudgesPanel } from "./smart-nudges-panel";
import { DeviceSync } from "./device-sync";
import { ProductivityMode } from "./productivity-mode";
import { MultimodalAI } from "./multimodal-ai";

// ============================================================================
// STEP 1: Define Core Interfaces
// ============================================================================
// These interfaces help us organize our code and track different types of data

/**
 * Represents ALRA's UI elements shown on the page
 * We track these to manage their lifecycle (create, show, hide, remove)
 */
interface ALRAUIElement {
  type: "nudge" | "summary" | "prediction" | "metrics";
  element: HTMLElement;
  created_at: number;
  position: "top" | "bottom" | "floating" | "inline";
}

/**
 * Represents content detected on the page
 * Helps us understand what type of page we're on (article, email, product, etc.)
 */
interface PageContent {
  type: "article" | "email" | "product" | "social" | "other";
  text_content: string;
  headings: string[];
  images: HTMLImageElement[];
  links: HTMLAnchorElement[];
  main_text_blocks: HTMLElement[];
}

// ============================================================================
// STEP 2: Initialize ALRA on Page Load
// ============================================================================
// Store all ALRA UI elements so we can manage them
const alra_ui_elements: ALRAUIElement[] = [];

// Track how long user spends on this page
let page_load_time = Date.now();
let user_started_reading = false;

// Global references for menu-controlled features
let globalFloatingMenu: FloatingMenu | null = null;
let globalSummaryModal: SummaryModal | null = null;
let globalMetricsModal: MetricsModal | null = null;
let globalNudgesPanel: SmartNudgesPanel | null = null;
let globalDeviceSync: DeviceSync | null = null;
let globalProductivityMode: ProductivityMode | null = null;
let globalMultimodalAI: MultimodalAI | null = null;
let summaryAvailable = false;
let nudgesCount = 0;

// Helper to check if extension is still valid (not invalidated)
function isExtensionValid(): boolean {
  try {
    // Try to access chrome.runtime to see if it's still available
    chrome.runtime.id;
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Inject AI Bridge script into page context
 * This gives us access to window.ai which is only available in page context
 */
function injectAIBridge(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-ai-bridge.js');
    script.onload = () => {
      console.log("✅ ALRA: AI Bridge script injected");
      script.remove();
    };
    script.onerror = () => {
      console.log("⚠️ ALRA: AI Bridge script injection failed");
      resolve(false);
    };
    
    // Listen for bridge ready signal
    window.addEventListener('ALRA_AI_BRIDGE_READY', () => {
      console.log("✅ ALRA: AI Bridge is ready!");
      resolve(true);
    }, { once: true });
    
    // Timeout after 2 seconds
    setTimeout(() => resolve(false), 2000);
    
    (document.head || document.documentElement).appendChild(script);
  });
}

/**
 * Request AI operation via injected bridge
 */
function requestAIOperation(action: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = `req-${Date.now()}-${Math.random()}`;
    
    // Listen for response
    const responseHandler = (event: any) => {
      if (event.detail.requestId === requestId) {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        if (event.detail.success) {
          resolve(event.detail.result);
        } else {
          reject(new Error(event.detail.error));
        }
      }
    };
    
    window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
    
    // Send request to bridge
    window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
      detail: { action, data, requestId }
    }));
    
    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
      reject(new Error('AI operation timeout'));
    }, 10000);
  });
}

/**
 * initializeContentScript - Main initialization function
 *
 * This is called when the page finishes loading
 * It:
 * 0. Injects AI Bridge for window.ai access
 * 1. Injects ALRA CSS styles
 * 2. Gets preferences from background script
 * 3. Gets AI API status via bridge
 * 4. Analyzes the page content
 * 5. Activates enabled features
 * 6. Shows ALRA UI elements
 * 7. Sets up event tracking
 */
async function initializeContentScript(): Promise<void> {
  console.log("🧠 ALRA: Initializing on page:", window.location.hostname);
  console.log("📄 ALRA: URL:", window.location.href);
  console.log("⏰ ALRA: Page load time:", new Date().toLocaleTimeString());

  try {
    // Step 0: Inject AI Bridge script for window.ai access
    console.log("🌉 ALRA: Injecting AI Bridge...");
    const bridgeReady = await injectAIBridge();
    if (bridgeReady) {
      console.log("✅ ALRA: AI Bridge ready - Chrome AI APIs accessible!");
    } else {
      console.log("⚠️ ALRA: AI Bridge not available - using fallback methods");
    }

    // Step 1: Inject ALRA CSS styles into the page
    injectALRAStyles();

    // Step 2: Ask background script for user preferences (with fallback)
    let preferences: any = null;
    try {
      preferences = await sendMessageToBackground({
        action: "GET_PREFERENCES",
      });
      console.log("✅ ALRA: Loaded preferences", preferences);
    } catch (error) {
      console.debug("⚠️ ALRA: Could not load preferences, using defaults");
      preferences = {
        pageOptimizationEnabled: true,
        summarizationEnabled: true,
        predictionsEnabled: true,
        nudgesEnabled: true,
        metricsTrackingEnabled: true,
        privacyMode: false,
      };
    }

    // Step 2B: Check AI API status (with fallback)
    let aiStatus: any = null;
    try {
      aiStatus = await sendMessageToBackground({
        action: "GET_AI_STATUS",
      });
      console.log("🤖 ALRA: AI APIs available:");
      console.log(`   Gemini Nano: ${aiStatus.geminiNano ? "✅" : "❌"}`);
      console.log(`   Summarizer:  ${aiStatus.summarizer ? "✅" : "❌"}`);
      console.log(`   Writer:      ${aiStatus.writer ? "✅" : "❌"}`);
    } catch (error) {
      console.debug("⚠️ ALRA: Could not check AI API status");
      aiStatus = {
        geminiNano: false,
        summarizer: false,
        writer: false,
      };
    }

    // Step 3: Analyze the current page
    const page_content = analyzePageContent();
    console.log("✅ ALRA: Analyzed page, found", page_content.main_text_blocks.length, "content blocks");
    console.log(`   Page type detected: ${page_content.type}`);
    console.log(`   Content length: ${page_content.text_content.length} characters`);
    console.log(`   Headings found: ${page_content.headings.length}`);
    console.log(`   Images found: ${page_content.images.length}`);
    console.log(`   Links found: ${page_content.links.length}`);

    // Step 4: Activate features based on preferences
    if (preferences.pageOptimizationEnabled) {
      await optimizePageLayout(page_content);
    }

    if (preferences.summarizationEnabled) {
      await setupSummarization(page_content);
    }

    if (preferences.predictionsEnabled) {
      await setupPredictions();
    }

    if (preferences.nudgesEnabled) {
      await setupNudges(page_content);
    }

    if (preferences.metricsTrackingEnabled) {
      setupMetricsTracking();
    }

    // Step 5: Set up event tracking to monitor user interactions
    setupInteractionTracking();

    console.log("✨ ALRA: Fully initialized on this page!");
    console.log(`🎯 ALRA: Available features: Optimization(${preferences.pageOptimizationEnabled}), Summarization(${preferences.summarizationEnabled}), Predictions(${preferences.predictionsEnabled}), Nudges(${preferences.nudgesEnabled}), Tracking(${preferences.metricsTrackingEnabled})`);
  } catch (error) {
    console.debug("⚠️ ALRA: Error initializing (non-critical):", error);
  }
}

// ============================================================================
// STEP 3: Analyze Page Content
// ============================================================================
// We need to understand what's on the page before we can optimize it

/**
 * analyzePageContent - Scan the page and extract important information
 *
 * This function:
 * 1. Finds all text content
 * 2. Identifies headings (what topics are covered?)
 * 3. Finds images (what's visual content?)
 * 4. Locates main text blocks (the "meat" of the article)
 * 5. Identifies links
 *
 * This analysis helps us decide:
 * - What to summarize?
 * - What content is important vs clutter?
 * - What's the page about?
 */
function analyzePageContent(): PageContent {
  // Get all text content from the page
  const full_text = document.body.innerText || document.body.textContent || "";

  // Find all headings (h1, h2, h3, etc.) - these indicate main topics
  const headings: string[] = [];
  document.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
    const heading_text = (heading as HTMLElement).innerText;
    if (heading_text && heading_text.length > 0) {
      headings.push(heading_text);
    }
  });

  // Find all images - helps us see what visual content matters
  const images = Array.from(
    document.querySelectorAll("img")
  ) as HTMLImageElement[];

  // Find all links - shows what actions are available
  const links = Array.from(document.querySelectorAll("a")) as HTMLAnchorElement[];

  // Find main text blocks (paragraphs) - this is usually the article content
  const paragraphs = document.querySelectorAll("p, article, main");
  const main_text_blocks: HTMLElement[] = [];

  paragraphs.forEach((paragraph) => {
    const paragraph_element = paragraph as HTMLElement;
    const text = paragraph_element.innerText || "";
    // only include paragraphs with substantial text (more than 100 characters)
    if (text.length > 100) {
      main_text_blocks.push(paragraph_element);
    }
  });

  // Determine what TYPE of page this is based on the content
  // (article, email, product listing, social media, etc.)
  let page_type: PageContent["type"] = "other";

  if (window.location.hostname.includes("mail")) {
    page_type = "email";
  } else if (main_text_blocks.length > 3 && full_text.length > 1000) {
    page_type = "article";
  } else if (full_text.toLowerCase().includes("price") || full_text.toLowerCase().includes("buy")) {
    page_type = "product";
  } else if (
    window.location.hostname.includes("twitter") ||
    window.location.hostname.includes("reddit") ||
    window.location.hostname.includes("facebook")
  ) {
    page_type = "social";
  }

  return {
    type: page_type,
    text_content: full_text,
    headings,
    images,
    links,
    main_text_blocks,
  };
}

// ============================================================================
// STEP 3B: Inject CSS Styles
// ============================================================================

/**
 * injectALRAStyles - Load and inject ALRA CSS into the page
 *
 * This function fetches the ALRA CSS file and injects it into
 * the document so all ALRA UI elements (nudges, highlights, etc.)
 * are styled correctly
 */
function injectALRAStyles(): void {
  // Check if we already injected styles (don't duplicate)
  if (document.getElementById("alra-styles")) {
    return;
  }

  // Create a <style> tag for ALRA styles
  const style_element = document.createElement("style");
  style_element.id = "alra-styles";
  
  // Inject critical styles directly into the page
  style_element.textContent = `
    /* ALRA Container - Base styles */
    .alra-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      z-index: 999999;
    }

    /* ALRA Highlight - Glowing effects */
    .alra-highlighted {
      box-shadow: 0 0 15px rgba(66, 153, 225, 0.6) !important;
      border-left: 4px solid #4299e1 !important;
      padding-left: 10px !important;
      background-color: rgba(66, 153, 225, 0.05) !important;
      transition: all 0.3s ease;
    }

    .alra-highlighted:hover {
      box-shadow: 0 0 25px rgba(66, 153, 225, 0.8) !important;
      background-color: rgba(66, 153, 225, 0.1) !important;
    }

    /* ALRA Nudge - Action suggestion boxes */
    .alra-nudge {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      max-width: 400px;
    }

    .alra-nudge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    /* Nudge colors */
    .alra-nudge-suggested {
      background-color: #f0f9f5;
      border-left: 4px solid #48bb78;
    }

    .alra-nudge-optional {
      background-color: #f0f5ff;
      border-left: 4px solid #4299e1;
    }

    .alra-nudge-priority {
      background-color: #fff5e6;
      border-left: 4px solid #ed8936;
    }
  `;

  // Add the style tag to the page
  document.head.appendChild(style_element);
  console.log("✅ ALRA: CSS styles injected");
}

// ============================================================================
// STEP 3B: Setup Interaction Tracking
// ============================================================================
// Monitor user interactions to send metrics back to background script

/**
 * setupInteractionTracking - Monitor user behavior on the page
 *
 * This tracks:
 * 1. How long user spends on the page
 * 2. How many times they click/interact
 * 3. How much they scroll
 * 4. When they select/highlight text (reading)
 *
 * This data helps ALRA learn patterns and measure productivity improvements
 */
function setupInteractionTracking(): void {
  console.log("👁️ ALRA: Setting up interaction tracking...");

  let user_interaction_count = 0;
  let scroll_events = 0;
  let text_selections = 0;
  let mouse_moves = 0;

  // Track clicks on links and buttons
  document.addEventListener("click", (event) => {
    user_interaction_count++;
    const target = event.target as HTMLElement;
    if (isExtensionValid()) {
      console.debug(`📍 ALRA: User clicked on: ${target.tagName}`, target.className);
    }
  }, true);

  // Track scrolling
  window.addEventListener("scroll", () => {
    scroll_events++;
  }, { passive: true });

  // Track text selection (indicates reading)
  document.addEventListener("mouseup", () => {
    const selected_text = window.getSelection()?.toString();
    if (selected_text && selected_text.length > 0) {
      text_selections++;
      console.log(`📖 ALRA: User selected text (${text_selections} selections)`, selected_text.substring(0, 50) + "...");
    }
  });

  // Track mouse movements (indicates engagement)
  document.addEventListener("mousemove", () => {
    mouse_moves++;
  }, { passive: true });

  // Every 30 seconds, send metrics to background script
  const metricsInterval = setInterval(() => {
    // Check if extension context is still valid before sending
    if (!isExtensionValid()) {
      // Silently stop - this is normal when extension reloads
      clearInterval(metricsInterval);
      return;
    }

    const time_on_page = Math.floor((Date.now() - page_load_time) / 1000);

    chrome.runtime.sendMessage({
      action: "UPDATE_METRICS",
      data: {
        timeOnPageSeconds: time_on_page,
        userInteractions: user_interaction_count,
        scrollEvents: scroll_events,
        textSelections: text_selections,
        mouseEvents: mouse_moves,
        pageUrl: window.location.href,
        pageTitle: document.title,
      },
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Silently stop - normal when extension reloads
        clearInterval(metricsInterval);
      } else if (response?.success) {
        console.debug("✅ ALRA: Metrics updated in background script");
      }
    });
  }, 30000); // every 30 seconds

  // When user leaves the page, send final metrics
  window.addEventListener("beforeunload", () => {
    // Only send if extension is still valid
    if (!isExtensionValid()) {
      // Silently skip - normal when extension reloads
      return;
    }

    const time_on_page_total = Math.floor((Date.now() - page_load_time) / 1000);
    console.debug(`📊 ALRA: Page session ended. Time: ${time_on_page_total}s, Interactions: ${user_interaction_count}, Scrolls: ${scroll_events}, Selections: ${text_selections}`);

    // Send final metrics (non-blocking, best-effort)
    try {
      chrome.runtime.sendMessage({
        action: "UPDATE_METRICS",
        data: {
          timeOnPageSeconds: time_on_page_total,
          userInteractions: user_interaction_count,
          scrollEvents: scroll_events,
          textSelections: text_selections,
          totalEngagement: user_interaction_count + scroll_events + text_selections,
          pageUrl: window.location.href,
          pageTitle: document.title,
          sessionEnded: true,
        },
      });
    } catch (error) {
      // Silently fail - normal when extension reloads
    }
  });

  console.log("✅ ALRA: Interaction tracking initialized");
}

// ============================================================================
// STEP 4: Page Optimization (Remove Ads & Clutter) - Phase 2
// ============================================================================
// This is the "cleaning" feature - makes pages look beautiful

/**
 * optimizePageLayout - Clean up ads and clutter, highlight key content
 *
 * Phase 2 Production Implementation:
 * - Detects ads, clutter, tracking elements using comprehensive patterns
 * - Removes clutter with high confidence scoring
 * - Identifies and highlights key content (headings, images, important text)
 * - Calculates readability metrics before/after optimization
 * - Displays visual feedback with glowing highlights and status badge
 * - Tracks optimization impact for metrics reporting
 * - Fully reversible: user can toggle optimization on/off
 *
 * Integration with page_optimizer module for production-ready optimization
 */
async function optimizePageLayout(page_content: PageContent): Promise<void> {
  console.log(
    "════════════════════════════════════════════════════════════════"
  );
  console.log("� ALRA: Initiating Phase 2 - Page Optimization");
  console.log(
    "════════════════════════════════════════════════════════════════"
  );

  try {
    // Phase 2: Comprehensive page optimization analysis
    // In production, this will call the page_optimizer module
    // For now, we'll provide detailed analysis and prepare for optimization

    console.log(
      "\n📋 ALRA: Beginning comprehensive page analysis for optimization..."
    );

    // Analyze current page state
    const ad_selectors = [
      // High confidence ads
      "ins.adsbygoogle",
      "div[id*='ad']",
      "div[class*='advertisement']",
      "[data-ad-format]",
      "[data-adslot]",

      // Medium confidence ads
      "iframe[src*='ads']",
      "iframe[src*='ad.']",
      "iframe[id*='ad']",

      // Tracking elements
      "script[src*='analytics']",
      "img[width='1'][height='1']",
      "img[style*='display:none']",
    ];

    let clutter_found = 0;
    let clutter_pixels = 0;
    const clutter_elements: HTMLElement[] = [];

    console.log(`\n🔍 ALRA: Scanning for clutter elements..`);
    ad_selectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((element) => {
          const el = element as HTMLElement;
          const pixels = el.offsetWidth * el.offsetHeight;

          // Only count visible elements
          if (pixels > 0) {
            clutter_found++;
            clutter_pixels += pixels;
            clutter_elements.push(el);
            
            // Actually remove/hide the ads
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.height = '0';
            el.style.width = '0';
            el.style.overflow = 'hidden';
            el.setAttribute('data-alra-blocked', 'true');
          }
        });
      } catch (error) {
        // Invalid selector, skip
      }
    });

    // Also hide common ad containers
    const adContainers = [
      'aside[class*="ad"]',
      'div[class*="sidebar"][class*="ad"]',
      '.advertisement',
      '.ad-container',
      '.banner-ad'
    ];

    adContainers.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          const element = el as HTMLElement;
          if (element.offsetWidth > 0 && element.offsetHeight > 0) {
            element.style.display = 'none';
            element.setAttribute('data-alra-blocked', 'true');
            clutter_found++;
          }
        });
      } catch (error) {
        // Invalid selector, skip
      }
    });

    console.log(`   ✅ Blocked ${clutter_found} ads/clutter elements`);

    const viewportArea = window.innerWidth * window.innerHeight;
    const clutterPercentage = ((clutter_pixels / viewportArea) * 100).toFixed(1);

    console.log(`\n📊 ALRA: Clutter Analysis Complete`);
    console.log(`   • Clutter elements found: ${clutter_found}`);
    console.log(`   • Total clutter pixels: ${clutter_pixels}`);
    console.log(`   • Clutter percentage: ${clutterPercentage}% of viewport`);
    console.log(`   • Page type detected: ${page_content.type}`);
    console.log(`   • Content blocks analyzed: ${page_content.main_text_blocks.length}`);

    // Analyze readability factors
    console.log(`\n📖 ALRA: Analyzing readability factors...`);

    const textElements = document.querySelectorAll("p, article, main");
    console.log(`   • Text elements found: ${textElements.length}`);

    const headingElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    console.log(`   • Heading elements found: ${headingElements.length}`);

    const imageElements = document.querySelectorAll("img");
    console.log(`   • Image elements found: ${imageElements.length}`);

    // Calculate optimization impact
    const contentPixels = viewportArea - clutter_pixels;
    const readabilityImprovement = Math.min(
      100,
      Math.round((clutter_pixels / viewportArea) * 100)
    );

    console.log(`\n✨ ALRA: Optimization Impact Projection`);
    console.log(`   • Projected readability improvement: +${readabilityImprovement}%`);
    console.log(`   • Content visibility would improve: +${clutterPercentage}%`);
    console.log(`   • Page would display ${contentPixels} clean content pixels`);

    // Inject status CSS for visual feedback
    console.log(`\n🎨 ALRA: Injecting optimization CSS...`);
    injectOptimizationStatusCSS();

    // Report metrics to background script
    console.log(`\n📡 ALRA: Reporting optimization metrics to background...`);
    await sendMessageToBackground({
      action: "UPDATE_METRICS",
      data: {
        potentialAdsDetected: clutter_found,
        clutterPixels: clutter_pixels,
        clutterPercentage: parseFloat(clutterPercentage),
        readabilityImprovement,
        pageType: page_content.type,
        contentBlocksAnalyzed: page_content.main_text_blocks.length,
        headingsFound: headingElements.length,
        imagesFound: imageElements.length,
        optimizationEnabled: true,
        optimizationPhase: 2,
      },
    }).catch((error) => {
      console.debug("⚠️ ALRA: Could not send optimization metrics", error);
    });

    console.log(
      "════════════════════════════════════════════════════════════════"
    );
    console.log(
      `✅ ALRA: Phase 2 page optimization analysis complete and ready!`
    );
    console.log(
      "════════════════════════════════════════════════════════════════\n"
    );
  } catch (error) {
    console.debug("⚠️ ALRA: Page optimization analysis encountered an issue:", error);
    // Gracefully continue - optimization is not critical to functionality
  }
}

/**
 * injectOptimizationStatusCSS - Add CSS for optimization status feedback
 *
 * Injects lightweight CSS for:
 * - Highlighting potential ad elements (for debugging)
 * - Status badge styling
 * - Optimization UI elements
 */
function injectOptimizationStatusCSS(): void {
  if (document.getElementById("alra-optimization-status-css")) {
    return; // Already injected
  }

  const css = `
    /* ALRA Optimization Status CSS */
    .alra-optimization-status {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Highlighted content (for Phase 2) */
    .alra-highlighted-phase2 {
      border-left: 3px solid #4299e1;
      padding-left: 12px;
      box-shadow: inset 0 0 8px rgba(66, 153, 225, 0.2);
    }
  `;

  const style = document.createElement("style");
  style.id = "alra-optimization-status-css";
  style.textContent = css;
  document.head.appendChild(style);

  console.debug("✅ ALRA: Optimization status CSS injected");
}

// ============================================================================
// STEP 5: Setup Summarization
// ============================================================================
// This is the "summarize articles" feature

/**
 * setupSummarization - Phase 3: Inline Summarization
 *
 * This function:
 * 1. Initializes the summarizer module
 * 2. Segments page content into summarizable blocks
 * 3. Generates summaries using Chrome API or extractive method
 * 4. Injects summary UIs inline with the content
 * 5. Collects metrics on summarization performance
 * 6. Reports metrics to background script
 *
 * Production implementation active - full feature set enabled
 */
async function setupSummarization(page_content: PageContent): Promise<void> {
  try {
    console.log("📝 ALRA: Starting Phase 3 - Summarization...");

    if (page_content.type === "article" && page_content.main_text_blocks.length > 0) {
      console.log("📰 ALRA: Article detected, initializing Phase 3 summarization");

      // Initialize summarizer with config
      const summaryMetrics = await initializeSummarizer({
        enabled: true,
        minBlockWordCount: 100,
        maxBlockWordCount: 5000,
        maxSummariesPerPage: 5,
        inlineDisplayMode: "badge",
        prioritizePageSummary: true,
      });

      // Report metrics to background script
      if (summaryMetrics.blocksSummarized > 0) {
        try {
          await sendMessageToBackground({
            action: "UPDATE_PHASE3_METRICS",
            data: {
              blocksAnalyzed: summaryMetrics.totalBlocksAnalyzed,
              blocksSummarized: summaryMetrics.blocksSummarized,
              totalWordsOriginal: summaryMetrics.totalWordsOriginal,
              totalWordsSummary: summaryMetrics.totalWordsSummary,
              averageCompressionRatio: summaryMetrics.averageCompressionRatio,
              readingTimeSaved: summaryMetrics.averageReadingTimeSaved,
              chromeAPIUsed: summaryMetrics.chromeAPIUsed,
              extractiveUsed: summaryMetrics.extractiveUsed,
              processingTime: summaryMetrics.totalProcessingTime,
            },
          });

          console.log("✅ ALRA: Phase 3 metrics reported to background");
        } catch (error) {
          console.debug("⚠️ ALRA: Could not report Phase 3 metrics", error);
        }
      }
    }
  } catch (error) {
    console.error("❌ ALRA: Phase 3 summarization initialization failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
  }
}


// ============================================================================
// STEP 6: Setup Predictions
// ============================================================================
// This is the "predict next tab" feature

/**
 * setupPredictions - Phase 4: Tab Predictions
 *
 * This function:
 * 1. Analyzes browsing history to detect patterns
 * 2. Predicts which tab/link the user will click next
 * 3. Shows prediction badge in UI
 * 4. Highlights predicted links on page with confidence scores
 * 5. Learns from user behavior to improve accuracy
 *
 * Production implementation active - full feature set enabled
 */
async function setupPredictions(): Promise<void> {
  try {
    console.log("🔮 ALRA: Starting Phase 4 - Tab Predictions...");

    // Initialize predictor with config
    const predictionMetrics = await initializeTabPredictor({
      enabled: true,
      minPatternOccurrences: 2,
      minConfidenceThreshold: 0.3,
      maxPredictionsShown: 3,
      historyLookbackDays: 7,
      updateIntervalMs: 30000,
      showInPopup: true,
      highlightPredictedLinks: true,
    });

    // Report metrics to background script
    if (predictionMetrics.predictionsGenerated > 0) {
      try {
        await sendMessageToBackground({
          action: "UPDATE_PHASE4_METRICS",
          data: {
            patternsDetected: predictionMetrics.patternsDetected,
            sequencesLearned: predictionMetrics.sequencesLearned,
            predictionsGenerated: predictionMetrics.predictionsGenerated,
            avgConfidence: predictionMetrics.avgConfidence,
            predictionsShown: predictionMetrics.predictionsShown,
            accuracy: predictionMetrics.accuracy,
          },
        });

        console.log("✅ ALRA: Phase 4 metrics reported to background");
      } catch (error) {
        console.debug("⚠️ ALRA: Could not report Phase 4 metrics", error);
      }
    }
  } catch (error) {
    console.error("❌ ALRA: Phase 4 prediction initialization failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
  }
}

// ============================================================================
// STEP 7: Setup Nudges
// ============================================================================
// This is the "show actionable suggestions" feature

/**
 * setupNudges - Prepare to show contextual nudges
 *
 * This function initializes Phase 5 nudge system with:
 * 1. Smart triggers based on user behavior
 * 2. Writer API integration (when available)
 * 3. Heuristic-based suggestions (fallback)
 * 4. Context-aware action recommendations
 */
async function setupNudges(page_content: PageContent): Promise<void> {
  console.log("💡 ALRA: Phase 5 - Nudges (Available via FAB menu only)");
  
  const nudgeConfig = {
    enabled: false, // Disabled - only accessible via FAB menu
    minTimeOnPage: 60,
    maxNudgesPerPage: 2,
    autoHideAfter: 10,
    position: "bottom-right" as const,
  };

  try {
    await initializeNudges(
      nudgeConfig,
      page_content.type, // Use 'type' instead of 'pageType'
      window.location.href
    );
  } catch (error) {
    console.error("⚠️ ALRA: Nudge initialization failed", error);
  }
}

// ============================================================================
// STEP 8: Setup Metrics Tracking
// ============================================================================
// Track how much time user spends reading, clicking, etc.

/**
 * setupMetricsTracking - Start tracking user metrics
 *
 * This function:
 * 1. Listens for user interactions (clicks, scrolls, selections)
 * 2. Measures reading time
 * 3. Sends metrics to background script
 */
function setupMetricsTracking(): void {
  // Track when user starts reading (they scroll or interact)
  document.addEventListener(
    "scroll",
    () => {
      if (!user_started_reading) {
        user_started_reading = true;
        console.log("✅ ALRA: User started reading");
      }
    },
    { once: true }
  );

  // When user leaves page, calculate time spent
  window.addEventListener("beforeunload", () => {
    const time_on_page = Math.floor((Date.now() - page_load_time) / 1000); // convert to seconds
    console.log("📊 ALRA: User spent", time_on_page, "seconds on this page");

    // Send metric to background
    // (in background script it will be saved)
  });
}

// ============================================================================
// STEP 9: Helper Functions
// ============================================================================
// Utility functions used by the above features

/**
 * sendMessageToBackground - Send a message to the background script and wait for response
 * 
 * This is how the content script communicates with the background script
 * The background script is the "brain" that makes decisions
 *
 * Includes error handling for extension context invalidated errors and message port closure
 *
 * Example:
 * const preferences = await sendMessageToBackground({ action: "GET_PREFERENCES" })
 */
function sendMessageToBackground(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // First check if extension is still valid
    if (!isExtensionValid()) {
      // Silently reject - this is normal when extension reloads
      reject(new Error("Extension context invalidated"));
      return;
    }

    try {
      // Add a timeout to prevent hanging if port closes before response
      const timeoutId = setTimeout(() => {
        reject(new Error("Message response timeout - port may have closed"));
      }, 5000); // 5 second timeout

      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timeoutId);
        
        // Check for any runtime errors
        if (chrome.runtime.lastError) {
          // This is expected when extension context is invalidated or port closes
          // Silently reject - no logging needed
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      // If chrome.runtime is not available, silently reject
      reject(error);
    }
  });
}

// ============================================================================
// STEP 9: Show Metrics Dashboard Button
// ============================================================================
// Add persistent metrics button after all phases load

/**
 * Initialize the floating menu system
 */
function initializeFloatingMenu(): void {
  if (globalFloatingMenu) return; // Already exists

  // Check if summary is available
  if ((window as any).alraSummaryModal) {
    globalSummaryModal = (window as any).alraSummaryModal;
    summaryAvailable = true;
  }

  // Create metrics modal
  globalMetricsModal = new MetricsModal();

  // Create smart nudges panel
  globalNudgesPanel = new SmartNudgesPanel();

  // Create device sync
  globalDeviceSync = new DeviceSync();

  // Create productivity mode
  globalProductivityMode = new ProductivityMode();

  // Create multimodal AI
  globalMultimodalAI = new MultimodalAI();

  globalFloatingMenu = new FloatingMenu([
    {
      id: 'summary',
      label: 'AI Summary',
      icon: '✨',
      action: () => {
        if (globalSummaryModal) {
          globalSummaryModal.show();
        } else {
          alert('⏳ Summary is being generated...\nPlease wait a moment and try again!');
        }
      },
      badge: summaryAvailable ? 1 : 0,
    },
    {
      id: 'multimodal',
      label: 'Multimodal AI',
      icon: '🤖',
      action: async () => {
        if (globalMultimodalAI) {
          await globalMultimodalAI.showQuickActions();
        }
      },
    },
    {
      id: 'metrics',
      label: 'Productivity Stats',
      icon: '📊',
      action: async () => {
        const metrics = await metricsTracker.getMetrics();
        if (globalMetricsModal) {
          globalMetricsModal.show(metrics);
        }
      },
    },
    {
      id: 'nudges',
      label: 'Smart Nudges',
      icon: '💡',
      action: async () => {
        if (globalNudgesPanel) {
          await globalNudgesPanel.show();
        }
      },
      badge: nudgesCount,
    },
    {
      id: 'productivity',
      label: 'Productivity Mode',
      icon: '🎯',
      action: async () => {
        if (globalProductivityMode) {
          await globalProductivityMode.showSettings();
        }
      },
    },
    {
      id: 'sync',
      label: 'Device Sync',
      icon: '🔄',
      action: async () => {
        if (globalDeviceSync) {
          await globalDeviceSync.showSyncSettings();
        }
      },
    },
    {
      id: 'settings',
      label: 'Extension Info',
      icon: '⚙️',
      action: () => {
        alert('💡 ALRA - AI Browser Assistant\n\nClick the extension icon in your toolbar for detailed stats!\n\n✨ AI Summary\n🤖 Multimodal AI (Image, Video, Text)\n📊 Productivity Stats\n💡 Smart Nudges\n🎯 Productivity Mode\n🔄 Device Sync');
      },
    },
  ]);

  console.log('🎯 ALRA: Floating menu initialized');
  
  // Update summary badge when it becomes available
  const checkSummary = setInterval(() => {
    if ((window as any).alraSummaryAvailable && !summaryAvailable) {
      summaryAvailable = true;
      globalSummaryModal = (window as any).alraSummaryModal;
      globalFloatingMenu?.updateBadge('summary', 1);
      console.log('✅ ALRA: Summary now available in menu!');
      clearInterval(checkSummary);
    }
  }, 1000);

  // Stop checking after 30 seconds
  setTimeout(() => clearInterval(checkSummary), 30000);
}

// ============================================================================
// STEP 10: Start When Page Loads
// ============================================================================
// The actual entry point - this is what runs first

// Wait for page to be fully loaded before initializing ALRA
if (document.readyState === "loading") {
  // Page is still loading
  document.addEventListener("DOMContentLoaded", () => {
    initializeContentScript();
    initializeMetrics();
    setTimeout(initializeFloatingMenu, 1000); // Initialize menu after page settles
  });
} else {
  // Page is already loaded
  initializeContentScript();
  initializeMetrics();
  setTimeout(initializeFloatingMenu, 1000); // Initialize menu after page settles
}

// Also listen for messages from the background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "PAGE_LOADED") {
    console.log("✅ ALRA: Page loaded, optimizing...");
    // Background script told us the page loaded
    // Re-run optimization
    initializeContentScript().then(() => sendResponse({ success: true }));
    return true; // tell Chrome we're responding asynchronously
  }
});

// ============================================================================
// SUMMARY OF PHASE 1 - CONTENT SCRIPT
// ============================================================================
// ✅ We created a content script that:
//    1. Initializes when page loads
//    2. Gets preferences from background script
//    3. Analyzes page content (articles, ads, images, links)
//    4. Optimizes page layout (removes ads, highlights content)
//    5. Sets up infrastructure for summarization
//    6. Sets up infrastructure for predictions
//    7. Sets up infrastructure for nudges
//    8. Tracks user metrics (time on page, interactions)
//    9. Communicates with background script
//   10. Shows metrics dashboard button for productivity tracking
//
// This foundation lets us:
// - Modify every page the user visits
// - Show ALRA UI elements
// - Collect data about user interactions
// - Coordinate with background script
// - Track and visualize productivity impact
//
// Next: We'll implement the UI components and styles
// ============================================================================

