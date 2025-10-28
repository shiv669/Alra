/**
 * ALRA Phase 5: Contextual Nudges Engine
 * 
 * Generates intelligent, context-aware action suggestions using:
 * - Page analysis
 * - User behavior tracking
 * - Chrome Writer API (when available)
 * - Heuristic-based suggestions (fallback)
 */

import { metricsTracker } from './metrics';

export interface NudgeConfig {
  enabled: boolean;
  minTimeOnPage?: number; // seconds before showing nudge
  maxNudgesPerPage?: number;
  autoHideAfter?: number; // seconds
  position?: "bottom-right" | "top-right" | "inline";
}

export interface NudgeTrigger {
  userSpentTime: number;
  pageType: string;
  scrollDepth: number; // 0-100%
  hasInteracted: boolean;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

export interface Nudge {
  id: string;
  text: string;
  emoji: string;
  priority: "suggested" | "optional" | "high";
  action?: () => void;
  actionUrl?: string;
  actionText: string;
  timestamp: number;
  trigger: string; // what triggered this nudge
}

export interface NudgeMetrics {
  nudgesGenerated: number;
  nudgesShown: number;
  nudgesActedUpon: number;
  nudgesDismissed: number;
  avgTimeToAction: number;
  conversionRate: number;
}

// ============================================================================
// NUDGE TRIGGER SYSTEM
// ============================================================================

let timeOnPage = 0;
let scrollDepth = 0;
let hasInteracted = false;

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function calculateScrollDepth(): number {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  
  return Math.min(100, Math.round((scrollTop + windowHeight) / documentHeight * 100));
}

function shouldShowNudge(config: NudgeConfig, pageType: string): boolean {
  const minTime = config.minTimeOnPage || 30; // default 30 seconds
  
  // Don't show nudges too early
  if (timeOnPage < minTime) return false;
  
  // Show nudges based on page type and behavior
  if (pageType === "article" && scrollDepth > 50) return true;
  if (pageType === "documentation" && scrollDepth > 30) return true;
  if (pageType === "product" && hasInteracted) return true;
  
  return false;
}

// ============================================================================
// NUDGE GENERATION
// ============================================================================

async function generateNudgeWithWriterAPI(context: string): Promise<string | null> {
  try {
    // Check if Writer API is available
    if (!("ai" in window) || !("writer" in (window as any).ai)) {
      return null;
    }

    const writer = await (window as any).ai.writer.create({
      tone: "casual",
      length: "short",
    });

    const prompt = `Based on this content: "${context.substring(0, 300)}"
Suggest ONE specific, actionable next step (max 8 words).
Format: [action only, no emoji]
Examples: "Read related article", "Save for later", "Share with team"`;

    const result = await writer.write(prompt);
    return result;
  } catch (error) {
    console.debug("⚠️ ALRA: Writer API unavailable, using fallback");
    return null;
  }
}

function generateHeuristicNudges(pageType: string, pageUrl: string, scrollDepth: number): Nudge[] {
  const nudges: Nudge[] = [];
  const baseId = `nudge-${Date.now()}`;
  
  // Wikipedia-specific nudges
  if (pageUrl.includes("wikipedia.org")) {
    if (scrollDepth > 60) {
      nudges.push({
        id: `${baseId}-1`,
        text: "Explore related topics",
        emoji: "🔗",
        priority: "suggested",
        actionText: "See Also",
        trigger: "deep_scroll_wikipedia",
        timestamp: Date.now(),
        action: () => {
          // Scroll to "See also" section
          const seeAlsoSection = Array.from(document.querySelectorAll('h2, h3')).find(
            h => h.textContent?.toLowerCase().includes('see also')
          );
          if (seeAlsoSection) {
            seeAlsoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('✅ ALRA: Scrolled to "See also" section');
          }
        },
      });
    }
    
    if (scrollDepth > 40) {
      nudges.push({
        id: `${baseId}-2`,
        text: "Save this article for later",
        emoji: "📌",
        priority: "optional",
        actionText: "Bookmark",
        trigger: "mid_scroll_wikipedia",
        timestamp: Date.now(),
        action: async () => {
          // Use Chrome's bookmark API
          try {
            if (chrome.bookmarks) {
              await chrome.bookmarks.create({
                title: document.title,
                url: window.location.href,
              });
              showToast('✅ Bookmarked successfully!');
              console.log('✅ ALRA: Page bookmarked');
            }
          } catch (error) {
            // Fallback: add to favorites using browser's built-in
            window.open(`javascript:(function(){window.external.AddFavorite('${window.location.href}','${document.title}');})();`);
          }
        },
      });
    }
  }
  
  // GitHub-specific nudges
  if (pageUrl.includes("github.com")) {
    nudges.push({
      id: `${baseId}-3`,
      text: "Star this repository",
      emoji: "⭐",
      priority: "suggested",
      actionText: "Star",
      trigger: "github_repo",
      timestamp: Date.now(),
      action: () => {
        // Find and click the star button
        const starButton = document.querySelector<HTMLButtonElement>('button[data-test-id="star-button"], button[aria-label*="Star"]');
        if (starButton) {
          starButton.click();
          showToast('⭐ Starred repository!');
          console.log('✅ ALRA: Starred GitHub repository');
        } else {
          showToast('⚠️ Could not find star button');
        }
      },
    });
  }
  
  // Documentation sites
  if (pageType === "documentation" || pageUrl.includes("docs.") || pageUrl.includes("/docs/")) {
    if (scrollDepth > 50) {
      nudges.push({
        id: `${baseId}-4`,
        text: "Copy code example",
        emoji: "💻",
        priority: "high",
        actionText: "Copy Code",
        trigger: "docs_engagement",
        timestamp: Date.now(),
        action: async () => {
          // Find first code block and copy it
          const codeBlock = document.querySelector('pre code, .highlight code, code');
          if (codeBlock) {
            const code = codeBlock.textContent || '';
            await navigator.clipboard.writeText(code);
            showToast('✅ Code copied to clipboard!');
            console.log('✅ ALRA: Copied code example');
            
            // Track metrics
            await metricsTracker.trackEvent({
              type: 'click_reduced',
              value: 3, // Saved select, right-click, copy clicks
              timestamp: Date.now(),
            });
          }
        },
      });
    }
  }
  
  // News/Article sites
  if (pageType === "article") {
    if (scrollDepth > 70) {
      nudges.push({
        id: `${baseId}-5`,
        text: "Share this article",
        emoji: "📤",
        priority: "optional",
        actionText: "Share",
        trigger: "article_completion",
        timestamp: Date.now(),
        action: async () => {
          // Use Web Share API
          if (navigator.share) {
            try {
              await navigator.share({
                title: document.title,
                text: 'Check out this article!',
                url: window.location.href,
              });
              console.log('✅ ALRA: Article shared');
            } catch (error) {
              // User cancelled or error
              copyLinkToClipboard();
            }
          } else {
            // Fallback: copy link
            copyLinkToClipboard();
          }
        },
      });
    }
    
    if (timeOnPage > 120) { // 2 minutes
      nudges.push({
        id: `${baseId}-6`,
        text: "Take a 20-second break",
        emoji: "🧘",
        priority: "suggested",
        actionText: "Start Timer",
        trigger: "long_reading_session",
        timestamp: Date.now(),
        action: () => {
          // Start a 20-second timer
          let countdown = 20;
          const timerToast = showTimerToast(countdown);
          
          const interval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(interval);
              showToast('✅ Break complete! Back to reading 📖');
            } else {
              updateTimerToast(timerToast, countdown);
            }
          }, 1000);
          
          console.log('✅ ALRA: Started 20-second break timer');
        },
      });
    }
  }
  
  // General productivity nudges
  if (timeOnPage > 300) { // 5 minutes
    nudges.push({
      id: `${baseId}-7`,
      text: "Copy page summary",
      emoji: "📝",
      priority: "high",
      actionText: "Copy Summary",
      trigger: "extended_session",
      timestamp: Date.now(),
      action: async () => {
        // Get the page summary if it exists
        const summaryText = `📝 Summary of "${document.title}"\n\n` +
          `Read on: ${window.location.href}\n\n` +
          `You spent ${Math.floor(timeOnPage / 60)} minutes on this page.`;
        
        await navigator.clipboard.writeText(summaryText);
        showToast('✅ Summary copied to clipboard!');
        console.log('✅ ALRA: Copied page summary');
      },
    });
  }
  
  return nudges;
}

// Helper functions for nudge actions
function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function copyLinkToClipboard(): void {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('✅ Link copied to clipboard!');
  });
}

function showTimerToast(seconds: number): HTMLElement {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%);
    backdrop-filter: blur(20px);
    color: white;
    padding: 40px 60px;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 10000001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-align: center;
  `;
  toast.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">🧘</div>
    <div style="font-size: 64px; font-weight: 700; margin-bottom: 8px;" id="alra-timer-countdown">${seconds}</div>
    <div style="font-size: 16px; color: #cbd5e0;">Take a deep breath...</div>
  `;
  document.body.appendChild(toast);
  return toast;
}

function updateTimerToast(toast: HTMLElement, seconds: number): void {
  const countdown = toast.querySelector('#alra-timer-countdown');
  if (countdown) {
    countdown.textContent = seconds.toString();
  }
  if (seconds <= 0) {
    toast.remove();
  }
}

// ============================================================================
// NUDGE UI COMPONENTS
// ============================================================================

function createNudgeElement(nudge: Nudge): HTMLElement {
  const container = document.createElement("div");
  container.className = `alra-nudge alra-nudge-${nudge.priority}`;
  container.id = nudge.id;
  container.setAttribute("data-nudge-trigger", nudge.trigger);
  
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 340px;
    border: 1px solid rgba(0, 0, 0, 0.06);
  `;
  
  // Priority-based styling - modern colors
  let accentColor = "#2563EB"; // clean blue for suggested
  if (nudge.priority === "high") accentColor = "#EF4444"; // modern red
  if (nudge.priority === "optional") accentColor = "#10B981"; // modern green
  
  container.style.borderLeft = `3px solid ${accentColor}`;
  
  // Emoji icon
  const icon = document.createElement("div");
  icon.style.cssText = "font-size: 24px; flex-shrink: 0;";
  icon.textContent = nudge.emoji;
  
  // Text content
  const content = document.createElement("div");
  content.style.cssText = "flex: 1;";
  
  const text = document.createElement("div");
  text.style.cssText = "font-size: 14px; font-weight: 500; color: #1F2937; line-height: 1.5; margin-bottom: 4px;";
  text.textContent = nudge.text;
  
  content.appendChild(text);
  
  // Action button with modern styling
  const actionBtn = document.createElement("button");
  actionBtn.style.cssText = `
    background: ${accentColor};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  actionBtn.textContent = nudge.actionText;
  actionBtn.onmouseover = () => {
    actionBtn.style.transform = "translateY(-1px)";
    actionBtn.style.boxShadow = `0 4px 12px ${accentColor}40`;
  };
  actionBtn.onmouseout = () => {
    actionBtn.style.transform = "translateY(0)";
    actionBtn.style.boxShadow = "none";
  };
  
  actionBtn.onclick = () => {
    if (nudge.action) {
      nudge.action();
    }
    trackNudgeAction(nudge.id, "acted");
    nudgesCurrentlyVisible--;
    container.remove();
  };
  
  // Dismiss button with modern styling
  const dismissBtn = document.createElement("button");
  dismissBtn.style.cssText = `
    background: rgba(0, 0, 0, 0.04);
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    margin-left: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 6px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  dismissBtn.textContent = "×";
  dismissBtn.title = "Dismiss";
  dismissBtn.onmouseover = () => {
    dismissBtn.style.background = "rgba(0, 0, 0, 0.08)";
    dismissBtn.style.color = "#374151";
  };
  dismissBtn.onmouseout = () => {
    dismissBtn.style.background = "rgba(0, 0, 0, 0.04)";
    dismissBtn.style.color = "#9CA3AF";
  };
  dismissBtn.onclick = () => {
    trackNudgeAction(nudge.id, "dismissed");
    // Track this nudge type as dismissed to prevent similar ones
    dismissedNudgeTypes.add(nudge.trigger);
    nudgesCurrentlyVisible--;
    container.remove();
  };
  
  container.appendChild(icon);
  container.appendChild(content);
  container.appendChild(actionBtn);
  container.appendChild(dismissBtn);
  
  // Add slide-in animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  return container;
}

// ============================================================================
// NUDGE ORCHESTRATOR
// ============================================================================

const shownNudges = new Set<string>();
const dismissedNudgeTypes = new Set<string>(); // Track dismissed nudge types
let nudgesCurrentlyVisible = 0; // Track active nudges
let nudgeMetrics: NudgeMetrics = {
  nudgesGenerated: 0,
  nudgesShown: 0,
  nudgesActedUpon: 0,
  nudgesDismissed: 0,
  avgTimeToAction: 0,
  conversionRate: 0,
};

function trackNudgeAction(nudgeId: string, action: "acted" | "dismissed"): void {
  if (action === "acted") {
    nudgeMetrics.nudgesActedUpon++;
  } else {
    nudgeMetrics.nudgesDismissed++;
  }
  
  nudgeMetrics.conversionRate = nudgeMetrics.nudgesShown > 0
    ? (nudgeMetrics.nudgesActedUpon / nudgeMetrics.nudgesShown) * 100
    : 0;
  
  console.log(`📊 ALRA: Nudge ${action}: ${nudgeId}`);
}

async function showNudge(nudge: Nudge, config: NudgeConfig): Promise<void> {
  // Don't show same nudge twice
  if (shownNudges.has(nudge.id)) return;
  
  // Don't show if this nudge type was dismissed
  if (dismissedNudgeTypes.has(nudge.trigger)) return;
  
  // Don't show if we've hit the max nudges limit
  const maxNudges = config.maxNudgesPerPage || 3;
  if (nudgesCurrentlyVisible >= maxNudges) return;
  
  const element = createNudgeElement(nudge);
  document.body.appendChild(element);
  
  shownNudges.add(nudge.id);
  nudgesCurrentlyVisible++;
  nudgeMetrics.nudgesShown++;
  
  console.log(`💡 ALRA: Showing nudge: "${nudge.text}" (${nudge.priority})`);
  
  // Auto-hide after timeout
  if (config.autoHideAfter) {
    setTimeout(() => {
      if (document.body.contains(element)) {
        nudgesCurrentlyVisible--;
        element.remove();
      }
    }, config.autoHideAfter * 1000);
  }
}

export async function initializeNudges(config: NudgeConfig, pageType: string, pageUrl: string): Promise<NudgeMetrics> {
  console.log("💡 ALRA: Initializing Phase 5 - Contextual Nudges");
  
  if (!config.enabled) {
    console.log("⏭️ ALRA: Nudges disabled");
    return nudgeMetrics;
  }
  
  // Start tracking time and behavior
  setInterval(() => {
    timeOnPage++;
  }, 1000);
  
  window.addEventListener("scroll", () => {
    scrollDepth = calculateScrollDepth();
  });
  
  window.addEventListener("click", () => {
    hasInteracted = true;
  });
  
  // Check for nudge opportunities every 15 seconds
  setInterval(async () => {
    if (!shouldShowNudge(config, pageType)) return;
    
    // Don't generate more nudges if we've already shown the max
    const maxNudges = config.maxNudgesPerPage || 3;
    if (shownNudges.size >= maxNudges) return;
    
    // Generate nudges
    const heuristicNudges = generateHeuristicNudges(pageType, pageUrl, scrollDepth);
    nudgeMetrics.nudgesGenerated += heuristicNudges.length;
    
    // Try Writer API for first nudge
    if (heuristicNudges.length > 0) {
      const writerNudge = await generateNudgeWithWriterAPI(document.title + " " + document.body.innerText.substring(0, 500));
      
      if (writerNudge) {
        const aiNudge: Nudge = {
          id: `nudge-ai-${Date.now()}`,
          text: writerNudge,
          emoji: "✨",
          priority: "suggested",
          actionText: "Try It",
          trigger: "writer_api",
          timestamp: Date.now(),
        };
        await showNudge(aiNudge, config);
      } else {
        // Show heuristic nudges
        const nudgesToShow = heuristicNudges.slice(0, maxNudges - shownNudges.size);
        
        for (const nudge of nudgesToShow) {
          // Skip if this type was dismissed
          if (dismissedNudgeTypes.has(nudge.trigger)) continue;
          
          await showNudge(nudge, config);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Stagger nudges
        }
      }
    }
  }, 15000); // Check every 15 seconds
  
  console.log("═════════════════════════════════════════════════════════════════");
  console.log("✅ ALRA: Phase 5 - Contextual Nudges Active");
  console.log("═════════════════════════════════════════════════════════════════");
  console.log(`💡 Nudge system ready`);
  console.log(`   Min time on page: ${config.minTimeOnPage || 30}s`);
  console.log(`   Max nudges per page: ${config.maxNudgesPerPage || 3}`);
  console.log(`   Auto-hide after: ${config.autoHideAfter || 10}s`);
  console.log("═════════════════════════════════════════════════════════════════");
  
  return nudgeMetrics;
}

export function getNudgeMetrics(): NudgeMetrics {
  return { ...nudgeMetrics };
}
