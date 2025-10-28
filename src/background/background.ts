/**
 * ALRA Background Service Worker
 * 
 * This is the "brain" of the ALRA extension that runs in the background
 * It handles all the core logic like:
 * - Monitoring tab switches and user behavior patterns
 * - Managing the Chrome Storage for persisting data
 * - Communicating between content scripts and the popup
 * - Initializing AI APIs (Gemini Nano, Summarizer, Writer)
 * 
 * Think of this as the central hub that coordinates all ALRA features
 */

// ============================================================================
// STEP 1: Initialize ALRA Core Data Structure
// ============================================================================
// We store all ALRA data in this interface, which helps us track:
// - User's browsing history (last 100 tabs visited)
// - Predictions we make (so we can learn from them)
// - Metrics (time saved, clicks reduced, etc.)
// - User preferences (features on/off)

interface ALRABrowsingSession {
  tabId: number;                    // unique tab identifier from Chrome
  url: string;                      // the website URL
  title: string;                    // the website title
  timestamp: number;                // when user visited this tab (milliseconds)
  durationOnTab: number;            // how long user stayed on this tab (seconds)
  sequence: number;                 // order in browsing history (1st, 2nd, 3rd, etc.)
}

interface ALRAMetrics {
  tabsPredictedCorrectly: number;   // how many times our prediction was right
  timeSavedSeconds: number;         // estimated total time saved user
  clicksReduced: number;            // ads blocked, scrolls reduced, etc.
  articlesSummarized: number;       // number of articles we summarized
  tasksCompleted: number;           // number of actions user took from our nudges
  avgReadingTimeReduction: number;  // percentage reduction in reading time
}

interface ALRAPreferences {
  pageOptimizationEnabled: boolean; // should we clean pages?
  summarizationEnabled: boolean;    // should we summarize?
  predictionsEnabled: boolean;      // should we predict next tab?
  nudgesEnabled: boolean;           // should we show nudges?
  metricsTrackingEnabled: boolean;  // should we track metrics?
  privacyMode: boolean;             // should we sync to cloud? (false = local only)
}

// ============================================================================
// STEP 2: Initialize Chrome AI APIs
// ============================================================================
// Google's on-device AI APIs for privacy-first intelligence
// These run locally and NEVER send data to servers

// Check if Chrome AI APIs are available (requires Chrome 127+)
let isGeminiNanoAvailable = false;
let isSummarizerAvailable = false;
let isWriterAvailable = false;

// Store references to AI models once initialized
let geminiNanoSession: any = null;
let summarizerSession: any = null;
let writerSession: any = null;

/**
 * Initialize Chrome AI APIs
 * These APIs work in service workers in Chrome Canary with flags enabled
 */
async function initializeChromeAIAPIs(): Promise<void> {
  console.log("🤖 ALRA: Checking for Chrome AI APIs in service worker...");

  // Try to initialize Summarizer API
  try {
    if (typeof self !== 'undefined' && 'ai' in self) {
      const aiNamespace = (self as any).ai;
      
      // Check Summarizer
      if ('summarizer' in aiNamespace) {
        const summarizerCapabilities = await aiNamespace.summarizer.capabilities();
        console.log("📊 ALRA: Summarizer capabilities:", summarizerCapabilities);
        
        if (summarizerCapabilities.available === "readily") {
          summarizerSession = await aiNamespace.summarizer.create({
            type: "key-points",
            format: "markdown",
            length: "medium",
          });
          isSummarizerAvailable = true;
          console.log("✅ ALRA: Summarizer API initialized successfully");
        } else {
          console.log(`⏳ ALRA: Summarizer status: ${summarizerCapabilities.available}`);
        }
      } else {
        console.log("⚠️ ALRA: summarizer not in ai namespace");
      }

      // Check Language Model (Prompt API)
      if ('languageModel' in aiNamespace) {
        const lmCapabilities = await aiNamespace.languageModel.capabilities();
        console.log("🧠 ALRA: Language Model capabilities:", lmCapabilities);
        
        if (lmCapabilities.available === "readily") {
          geminiNanoSession = await aiNamespace.languageModel.create();
          isGeminiNanoAvailable = true;
          console.log("✅ ALRA: Gemini Nano initialized successfully");
        } else {
          console.log(`⏳ ALRA: Language Model status: ${lmCapabilities.available}`);
        }
      } else {
        console.log("⚠️ ALRA: languageModel not in ai namespace");
      }

      // Check Writer/Rewriter API
      if ('rewriter' in aiNamespace) {
        const writerCapabilities = await aiNamespace.rewriter.capabilities();
        console.log("✍️ ALRA: Rewriter capabilities:", writerCapabilities);
        
        if (writerCapabilities.available === "readily") {
          writerSession = await aiNamespace.rewriter.create();
          isWriterAvailable = true;
          console.log("✅ ALRA: Writer API initialized successfully");
        } else {
          console.log(`⏳ ALRA: Writer status: ${writerCapabilities.available}`);
        }
      } else {
        console.log("⚠️ ALRA: rewriter not in ai namespace");
      }
    } else {
      console.log("⚠️ ALRA: window.ai not available in service worker");
    }
  } catch (error) {
    console.error("❌ ALRA: AI API initialization error:", error);
  }

  // Print summary
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧠 ALRA: AI APIs Status Report (Service Worker):");
  console.log(`   Gemini Nano: ${isGeminiNanoAvailable ? "✅ Ready" : "❌ Not available"}`);
  console.log(`   Summarizer:  ${isSummarizerAvailable ? "✅ Ready" : "❌ Not available"}`);
  console.log(`   Writer:      ${isWriterAvailable ? "✅ Ready" : "❌ Not available"}`);
  console.log("═══════════════════════════════════════════════════════════════");
  
  if (!isGeminiNanoAvailable && !isSummarizerAvailable && !isWriterAvailable) {
    console.log("ℹ️ ALRA: Using fallback implementations (extractive summarization, heuristic nudges)");
    console.log("ℹ️ ALRA: For Chrome AI APIs to work:");
    console.log("   1. Use Chrome Canary");
    console.log("   2. Enable flags in chrome://flags/");
    console.log("   3. Ensure Gemini Nano model is downloaded");
  }
}

// ============================================================================
// STEP 3: Initialize Default Data Structures
// ============================================================================
// When ALRA first starts, we set these default values
// If the user has used ALRA before, we'll load their saved data instead

const DEFAULT_PREFERENCES: ALRAPreferences = {
  pageOptimizationEnabled: true,
  summarizationEnabled: true,
  predictionsEnabled: true,
  nudgesEnabled: true,
  metricsTrackingEnabled: true,
  privacyMode: true,
};

const DEFAULT_METRICS: ALRAMetrics = {
  tabsPredictedCorrectly: 0,
  timeSavedSeconds: 0,
  clicksReduced: 0,
  articlesSummarized: 0,
  tasksCompleted: 0,
  avgReadingTimeReduction: 0,
};

// ============================================================================
// STEP 3: Tab Tracking System
// ============================================================================
// We need to track every time the user switches tabs
// This gives us the "browsing pattern" that we use to predict their next action

let browsing_history: ALRABrowsingSession[] = [];  // stores the last 100 tab transitions
let current_tab_id: number | null = null;          // which tab is user on RIGHT NOW?
let tab_start_time: number = Date.now();           // when did user switch to current tab?

/**
 * logTabTransition - Records when user switches to a different tab
 * 
 * This function is called every time the user clicks a tab
 * It calculates how long they spent on the previous tab, then saves it
 * 
 * Example flow:
 * 1. User on YouTube tab for 5 minutes
 * 2. User clicks Wikipedia tab
 * 3. This function records: "YouTube - 5 minutes"
 * 4. Now we track Wikipedia as current tab
 */
async function logTabTransition(tabId: number): Promise<void> {
  // if this is the same tab, don't log again (no tab switch)
  if (current_tab_id === tabId) {
    return;
  }

  // calculate how long user spent on the previous tab
  const duration_on_previous_tab = Math.floor(
    (Date.now() - tab_start_time) / 1000
  ); // convert milliseconds to seconds

  // if user was on a previous tab, save that session
  if (current_tab_id !== null) {
    try {
      // get the previous tab's information from Chrome
      const previous_tab = await chrome.tabs.get(current_tab_id);

      // create a new session record
      const session: ALRABrowsingSession = {
        tabId: current_tab_id,
        url: previous_tab.url || "unknown",
        title: previous_tab.title || "unknown",
        timestamp: Date.now(),
        durationOnTab: duration_on_previous_tab,
        sequence: browsing_history.length + 1,
      };

      // add this session to our history
      browsing_history.push(session);

      // keep only last 100 sessions (to avoid storing too much data)
      if (browsing_history.length > 100) {
        browsing_history = browsing_history.slice(-100);
      }

      // save to Chrome Storage so data persists even if extension restarts
      await chrome.storage.local.set({
        browsing_history: browsing_history,
      });
    } catch (error) {
      // if we can't get tab info, just silently continue
      // (tab might have been closed)
      console.warn("ALRA: Could not log tab transition", error);
    }
  }

  // now set this new tab as our "current tab"
  current_tab_id = tabId;
  tab_start_time = Date.now(); // reset the timer for this tab
}

// ============================================================================
// STEP 4: Chrome Event Listeners - Listen for User Actions
// ============================================================================
// We register "listeners" that wait for specific browser events
// When the event happens, we trigger our functions

/**
 * Listen for tab activation (when user clicks a tab)
 * This is the main event that triggers our tab tracking
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  logTabTransition(activeInfo.tabId);
});

/**
 * Listen for tab updates (when page loads, URL changes, etc.)
 * We use this to know when a new page is ready for ALRA to optimize it
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // page has finished loading, now notify content script to optimize it
    chrome.tabs.sendMessage(
      tabId,
      {
        action: "PAGE_LOADED",
        url: tab.url,
        title: tab.title,
      },
      (response) => {
        // content script will respond after optimizing the page
        if (chrome.runtime.lastError) {
          // content script might not be available on this page (like Chrome's internal pages)
          console.warn(
            "ALRA: Could not send message to content script",
            chrome.runtime.lastError
          );
        }
      }
    );
  }
});

// ============================================================================
// STEP 5: AI Helper Functions
// ============================================================================
// These functions use Chrome AI APIs to provide intelligence

/**
 * Summarize text using Chrome Summarizer API
 * Returns a concise summary of the input text
 */
async function summarizeContent(text: string): Promise<string> {
  if (!isSummarizerAvailable || !summarizerSession) {
    return "Summarizer not available. Please try again or enable it in settings.";
  }

  try {
    const summary = await summarizerSession.summarize(text);
    console.log("✅ ALRA: Content summarized successfully");
    return summary;
  } catch (error) {
    console.error("❌ ALRA: Summarization failed:", error);
    return "Could not summarize content.";
  }
}

/**
 * Get AI-powered action nudges based on current context
 * Uses Gemini Nano to suggest what user should do next
 */
async function generateActionNudges(
  currentUrl: string,
  recentHistory: ALRABrowsingSession[]
): Promise<string[]> {
  if (!isGeminiNanoAvailable || !geminiNanoSession) {
    return []; // AI not available, return no nudges
  }

  try {
    const prompt = `
You are ALRA, a browsing assistant. Analyze this user context and suggest 2-3 brief actionable nudges.

Current URL: ${currentUrl}
Recent browsing history:
${recentHistory.slice(-5).map((s) => `- ${s.title} (${Math.round(s.durationOnTab / 60)} min)`).join("\n")}

Generate 2-3 ultra-brief nudges (max 12 words each) as a JSON array:
["nudge1", "nudge2", "nudge3"]

Only respond with the JSON array, nothing else.
    `;

    const response = await geminiNanoSession.prompt(prompt);
    
    try {
      const nudges = JSON.parse(response);
      console.log("✅ ALRA: Generated action nudges:", nudges);
      return Array.isArray(nudges) ? nudges : [];
    } catch {
      console.warn("⚠️ ALRA: Could not parse nudges response:", response);
      return [];
    }
  } catch (error) {
    console.error("❌ ALRA: Nudge generation failed:", error);
    return [];
  }
}

/**
 * Predict next tab based on browsing history
 * Uses Gemini Nano to analyze patterns and suggest next likely tab
 */
async function predictNextTab(history: ALRABrowsingSession[]): Promise<string | null> {
  if (!isGeminiNanoAvailable || !geminiNanoSession || history.length < 3) {
    return null; // Not enough data or AI not available
  }

  try {
    const recentTabs = history.slice(-10).map((s) => s.title);
    
    const prompt = `
Analyze this browsing sequence and predict what the user will search for or visit next.
Recent tabs: ${recentTabs.join(" -> ")}

Predict the ONE most likely next action in 3-5 words. Respond with ONLY the prediction, nothing else.
    `;

    const response = await geminiNanoSession.prompt(prompt);
    console.log("🔮 ALRA: Predicted next tab:", response);
    return response.trim();
  } catch (error) {
    console.error("❌ ALRA: Prediction failed:", error);
    return null;
  }
}

// ============================================================================
// STEP 6: Message Handler - Communicate with Content Scripts
// ============================================================================
// Content scripts (running on each webpage) send messages to this background script
// We handle those messages and respond with data

/**
 * chrome.runtime.onMessage.addListener
 * 
 * This waits for messages from content scripts
 * Content scripts ask us for things like:
 * - "Should I optimize this page?"
 * - "Can you predict what the user does next?"
 * - "Summarize this content"
 * - "Here's a metric I tracked, please save it"
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // every message has an "action" field that tells us what to do

  if (request.action === "GET_PREFERENCES") {
    // content script wants to know our preferences
    chrome.storage.local.get("preferences", (result) => {
      const preferences = result.preferences || DEFAULT_PREFERENCES;
      sendResponse(preferences);
    });
    return true; // tell Chrome we'll respond asynchronously
  }

  if (request.action === "GET_AI_STATUS") {
    // content script wants to know which AI APIs are available
    sendResponse({
      geminiNano: isGeminiNanoAvailable,
      summarizer: isSummarizerAvailable,
      writer: isWriterAvailable,
    });
    return true;
  }

  if (request.action === "SUMMARIZE_CONTENT") {
    // content script wants to summarize text
    summarizeContent(request.text).then((summary) => {
      sendResponse({ success: true, summary });
    });
    return true; // async response
  }

  if (request.action === "GET_NUDGES") {
    // content script wants action nudges
    generateActionNudges(request.url, browsing_history).then((nudges) => {
      sendResponse({ success: true, nudges });
    });
    return true; // async response
  }

  if (request.action === "PREDICT_NEXT_ACTION") {
    // content script wants a prediction
    predictNextTab(browsing_history).then((prediction) => {
      sendResponse({ success: true, prediction });
    });
    return true; // async response
  }

  if (request.action === "GET_BROWSING_HISTORY") {
    // content script wants to see browsing history
    // (to predict next action or show stats)
    sendResponse(browsing_history);
    return true;
  }

  if (request.action === "SYNC_TABS") {
    // Device sync wants to save recommended tabs
    // These will appear in Chrome's native sync across devices
    console.log('📱 ALRA Background: Syncing recommended tabs...', request.tabs);
    
    // Save to sync storage (accessible on all devices)
    chrome.storage.sync.set({
      alra_recommended_tabs: {
        tabs: request.tabs,
        timestamp: Date.now()
      }
    });
    
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "UPDATE_METRICS") {
    // content script found a metric to update
    // (e.g., "I just summarized an article!")
    chrome.storage.local.get("metrics", (result) => {
      let metrics = result.metrics || DEFAULT_METRICS;
      // merge the new metric data
      metrics = { ...metrics, ...request.data };
      // save updated metrics
      chrome.storage.local.set({ metrics });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "LOG_PREDICTION") {
    // content script is logging a prediction they made
    // (so we can measure accuracy later)
    console.log("🔮 ALRA: Prediction logged", request.data);
    // we'll use this for ML model training in the future
    return true;
  }
});

// ============================================================================
// STEP 7: Initialize ALRA on First Install
// ============================================================================
// When the extension is first installed, we set up default data

/**
 * chrome.runtime.onInstalled
 * 
 * This event fires when:
 * 1. Extension is first installed
 * 2. Extension is updated to a new version
 * 
 * We use this to initialize default settings and AI APIs
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("🧠 ALRA Initialized - Welcome to smarter browsing!");
    console.log("📋 ALRA Phase 1: Foundation Setup Complete");
    console.log("   ✅ Tab tracking system ready");
    console.log("   ✅ Chrome Storage API connected");
    console.log("   ✅ Message handlers listening");
    console.log("   ⏳ Initializing Chrome AI APIs...");

    // set default preferences
    chrome.storage.local.set({
      preferences: DEFAULT_PREFERENCES,
      metrics: DEFAULT_METRICS,
      browsing_history: [],
      installation_time: Date.now(),
    });

    // Initialize AI APIs
    initializeChromeAIAPIs();

    // open welcome page to explain ALRA
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
    });
  } else if (details.reason === "update") {
    console.log("📦 ALRA Updated! Reinitializing AI APIs...");
    initializeChromeAIAPIs();
  }
});

// ============================================================================
// STEP 8: Load Saved Data on Extension Start
// ============================================================================
// When the background service worker starts, load any saved data from storage

/**
 * Initialize ALRA with saved data from previous sessions
 * 
 * This is called when the extension wakes up (user opens Chrome, etc.)
 * We restore the browsing history, preferences, and initialize AI APIs
 */
async function initializeALRA(): Promise<void> {
  try {
    console.log("🚀 ALRA: Starting service worker initialization...");
    
    const result = await chrome.storage.local.get([
      "browsing_history",
      "preferences",
      "metrics",
    ]);

    browsing_history = result.browsing_history || [];
    console.log("📚 ALRA: Loaded browsing history with", browsing_history.length, "entries");
    console.log("✅ ALRA: Chrome Storage API initialized");

    // Initialize AI APIs on startup
    await initializeChromeAIAPIs();

    console.log("✨ ALRA: Service worker ready!");
  } catch (error) {
    console.error("❌ ALRA: Error initializing", error);
  }
}

// Call initialization when service worker starts
initializeALRA();

// ============================================================================
// SUMMARY OF PHASE 1
// ============================================================================
// ✅ We created a system to:
//    1. Track every time user switches tabs
//    2. Store browsing patterns (last 100 sessions)
//    3. Save data to Chrome Storage (persists across restarts)
//    4. Listen for messages from content scripts
//    5. Communicate preferences and metrics
//    6. Initialize with default settings
//
// This foundation lets us:
// - Know what websites user visits and for how long
// - Predict next actions based on patterns
// - Track metrics (ads blocked, time saved, etc.)
// - Coordinate all ALRA features
//
// Next: We'll build the content script that optimizes pages and shows UI
// ============================================================================
