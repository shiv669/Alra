/**
 * ALRA Phase 4: Tab Prediction Module
 * 
 * Analyzes browsing patterns and highlights predicted next actions
 */

import { metricsTracker } from './metrics';

export interface TabPredictorConfig {
  enabled: boolean;
  minPatternOccurrences?: number;
  minConfidenceThreshold?: number;
  maxPredictionsShown?: number;
  historyLookbackDays?: number;
  updateIntervalMs?: number;
  showInPopup?: boolean;
  highlightPredictedLinks?: boolean;
}

export interface TabPredictorMetrics {
  patternsDetected: number;
  sequencesLearned: number;
  predictionsGenerated: number;
  avgConfidence: number;
  predictionsShown: number;
  accuracy: number;
}

interface LinkPrediction {
  element: HTMLAnchorElement;
  url: string;
  text: string;
  confidence: number;
  reason: string;
}

/**
 * Initialize tab prediction functionality
 */
export async function initializeTabPredictor(config: TabPredictorConfig): Promise<TabPredictorMetrics> {
  console.log("🔮 ALRA: Initializing Phase 4 - Tab Prediction");
  
  const finalConfig = {
    enabled: config.enabled ?? true,
    minConfidenceThreshold: config.minConfidenceThreshold ?? 0.6,
    maxPredictionsShown: config.maxPredictionsShown ?? 3,
    highlightPredictedLinks: config.highlightPredictedLinks ?? true,
  };

  const metrics: TabPredictorMetrics = {
    patternsDetected: 0,
    sequencesLearned: 0,
    predictionsGenerated: 0,
    avgConfidence: 0,
    predictionsShown: 0,
    accuracy: 0,
  };

  if (!finalConfig.enabled) {
    console.log("⏭️ ALRA: Tab Prediction disabled");
    return metrics;
  }

  // Analyze links on current page
  const predictions = await analyzePageLinks();
  metrics.predictionsGenerated = predictions.length;
  
  if (predictions.length > 0) {
    const avgConf = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    metrics.avgConfidence = avgConf;
    metrics.patternsDetected = predictions.length;
  }

  // Highlight predicted links
  if (finalConfig.highlightPredictedLinks) {
    const topPredictions = predictions
      .filter(p => p.confidence >= finalConfig.minConfidenceThreshold)
      .slice(0, finalConfig.maxPredictionsShown);
    
    topPredictions.forEach((prediction, index) => {
      highlightPredictedLink(prediction, index + 1);
      metrics.predictionsShown++;
    });
  }

  console.log("═════════════════════════════════════════════════════════════════");
  console.log("✅ ALRA: Phase 4 - Tab Prediction Complete");
  console.log("═════════════════════════════════════════════════════════════════");
  console.log(`🔮 Predictions generated: ${metrics.predictionsGenerated}`);
  console.log(`   Shown: ${metrics.predictionsShown}`);
  console.log(`   Avg confidence: ${(metrics.avgConfidence * 100).toFixed(0)}%`);
  console.log(`   Patterns detected: ${metrics.patternsDetected}`);
  console.log("═════════════════════════════════════════════════════════════════");

  return metrics;
}

/**
 * Analyze links on the page and predict which ones user might click
 */
async function analyzePageLinks(): Promise<LinkPrediction[]> {
  const predictions: LinkPrediction[] = [];
  const links = document.querySelectorAll("a[href]");
  
  console.log(`🔗 ALRA: Analyzing ${links.length} links on page...`);

  links.forEach((link) => {
    const anchor = link as HTMLAnchorElement;
    const href = anchor.href;
    const text = anchor.innerText.trim();
    
    // Skip invalid links
    if (!href || href.startsWith("javascript:") || href === "#" || text.length === 0) {
      return;
    }

    let confidence = 0;
    let reason = "";

    // Heuristic 1: Position in viewport (visible links more likely)
    const rect = anchor.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
    if (isVisible) {
      confidence += 0.3;
      reason = "visible";
    }

    // Heuristic 2: Link prominence (size, bold, heading)
    const computedStyle = window.getComputedStyle(anchor);
    const fontSize = parseInt(computedStyle.fontSize);
    const fontWeight = parseInt(computedStyle.fontWeight) || 400;
    
    if (fontSize >= 18) {
      confidence += 0.2;
      reason += reason ? ", large" : "large";
    }
    if (fontWeight >= 600) {
      confidence += 0.15;
      reason += reason ? ", bold" : "bold";
    }

    // Heuristic 3: Related to current topic (check for common keywords)
    const pageTitle = document.title.toLowerCase();
    const linkText = text.toLowerCase();
    const titleWords = pageTitle.split(/\s+/).filter(w => w.length > 3);
    const hasRelatedKeywords = titleWords.some(word => linkText.includes(word));
    
    if (hasRelatedKeywords) {
      confidence += 0.25;
      reason += reason ? ", related" : "related";
    }

    // Heuristic 4: Wikipedia specific - "See also" and related articles
    const parentText = anchor.parentElement?.textContent?.toLowerCase() || "";
    if (parentText.includes("see also") || parentText.includes("main article")) {
      confidence += 0.3;
      reason += reason ? ", suggested" : "suggested";
    }

    // Heuristic 5: Link classes that suggest importance
    const className = anchor.className.toLowerCase();
    if (className.includes("featured") || className.includes("recommended") || className.includes("related")) {
      confidence += 0.2;
      reason += reason ? ", featured" : "featured";
    }

    // Only include predictions above minimum threshold
    if (confidence >= 0.4) {
      predictions.push({
        element: anchor,
        url: href,
        text: text.substring(0, 100), // Limit text length
        confidence: Math.min(confidence, 1.0),
        reason,
      });
    }
  });

  // Sort by confidence
  predictions.sort((a, b) => b.confidence - a.confidence);

  console.log(`✅ ALRA: Found ${predictions.length} high-confidence link predictions`);
  return predictions;
}

/**
 * Highlight a predicted link with modern, professional visual indicator
 */
function highlightPredictedLink(prediction: LinkPrediction, rank: number): void {
  const { element, confidence, reason } = prediction;
  
  // Skip if already highlighted
  if (element.classList.contains("alra-predicted-link")) {
    return;
  }
  
  // Store original link text
  const originalText = element.innerText.trim();
  
  // Add prediction class
  element.classList.add("alra-predicted-link");
  element.setAttribute("data-prediction-rank", rank.toString());
  element.setAttribute("data-confidence", (confidence * 100).toFixed(0));
  element.setAttribute("data-reason", reason);
  
  // Apply modern minimal styling
  element.style.cssText += `
    position: relative;
    background: rgba(37, 99, 235, 0.04);
    border: 1.5px solid rgba(37, 99, 235, 0.15);
    padding: 6px 12px !important;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 2px;
    display: inline-block;
  `;
  
  // Create modern minimal badge
  const badge = document.createElement("span");
  badge.className = "alra-prediction-badge";
  badge.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    background: #2563EB;
    color: white;
    border-radius: 10px;
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 700;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    border: 2px solid white;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: 0.02em;
  `;
  badge.textContent = `${rank}`;
  badge.title = `Prediction #${rank}: ${(confidence * 100).toFixed(0)}% confidence - ${reason}`;
  
  // Create clean tooltip that shows on hover
  const tooltip = document.createElement("div");
  tooltip.className = "alra-prediction-tooltip";
  tooltip.style.cssText = `
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) scale(0.95);
    background: rgba(31, 41, 55, 0.96);
    backdrop-filter: blur(10px);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10001;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #60A5FA;">🎯 ${(confidence * 100).toFixed(0)}%</span>
      <span style="color: #9CA3AF;">·</span>
      <span style="color: #E5E7EB; font-weight: 400;">${reason}</span>
    </div>
  `;
  
  // Arrow for tooltip
  const arrow = document.createElement("div");
  arrow.style.cssText = `
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(26, 32, 44, 0.95);
  `;
  tooltip.appendChild(arrow);
  
  // Wrap element to contain absolute positioned elements
  const wrapper = document.createElement("span");
  wrapper.className = "alra-link-wrapper";
  wrapper.style.cssText = `
    position: relative;
    display: inline-block;
  `;
  
  if (element.parentElement) {
    element.parentElement.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    wrapper.appendChild(badge);
    wrapper.appendChild(tooltip);
  }
  
  // Track click on predicted link
  element.addEventListener("click", async () => {
    await metricsTracker.trackEvent({
      type: 'tab_predicted',
      value: 1, // 1 = correct prediction (user clicked it)
      timestamp: Date.now(),
      details: {
        confidence,
        reason,
        rank,
        url: prediction.url,
      }
    });
  });
  
  // Hover effects
  element.addEventListener("mouseenter", () => {
    element.style.transform = "translateY(-1px)";
    element.style.background = "rgba(37, 99, 235, 0.08)";
    element.style.borderColor = "rgba(37, 99, 235, 0.3)";
    element.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.15)";
    badge.style.transform = "scale(1.05)";
    
    // Show tooltip
    tooltip.style.opacity = "1";
    tooltip.style.transform = "translateX(-50%) scale(1)";
  });
  
  element.addEventListener("mouseleave", () => {
    element.style.transform = "translateY(0)";
    element.style.background = "rgba(37, 99, 235, 0.04)";
    element.style.borderColor = "rgba(37, 99, 235, 0.15)";
    element.style.boxShadow = "none";
    badge.style.transform = "scale(1)";
    
    // Hide tooltip
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateX(-50%) scale(0.95)";
  });
  
  console.log(`🎯 ALRA: Highlighted link #${rank}: "${originalText.substring(0, 50)}" (${(confidence * 100).toFixed(0)}%)`);
}




