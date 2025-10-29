/**
 * React Popup Entry Point
 *
 * This file mounts the React application into the extension popup
 * It displays meaningful insights and browsing analytics
 * Also initializes Chrome AI APIs (window.ai available in popup context)
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/globals.css";
import { initializeAIAPIs, getCapabilities } from "./ai-service";

/**
 * Step 1: Define the main App component
 * This displays ALRA dashboard with real-time insights
 */
function App() {
  // Step 1a: State for browsing session data
  const [sessionData, setSessionData] = React.useState({
    currentPage: "—",
    totalTabsVisited: 0,
    timeSpentBrowsing: 0,
    adsDetected: 0,
  });

  // Step 1b: State for insights
  const [insights, setInsights] = React.useState<string[]>([]);

  // Step 1c: State for feature toggles
  const [features, setFeatures] = React.useState({
    pageOptimization: true,
    summarization: true,
    predictions: true,
    nudges: true,
  });

  // Step 1d: State for AI APIs status
  const [aiStatus, setAIStatus] = React.useState({
    summarizer: false,
    languageModel: false,
    writer: false,
    rewriter: false,
  });

  /**
   * Step 1.5: Initialize Chrome AI APIs on mount
   */
  React.useEffect(() => {
    initializeAIAPIs().then(caps => {
      setAIStatus(caps);
      console.log("🤖 ALRA Popup: AI APIs initialized", caps);
    });
  }, []);

  /**
   * Step 2: Load real-time session data from Chrome Storage
   * This runs when component mounts and updates every 5 seconds
   */
  React.useEffect(() => {
    const loadSessionData = () => {
      chrome.storage.local.get(
        ["browsing_history", "metrics", "preferences"],
        (result) => {
          // Get current active tab info AND count ALL open tabs
          chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
            // Query ALL tabs across all windows
            chrome.tabs.query({}, (allTabs) => {
              if (activeTabs[0]) {
                const currentTab = activeTabs[0];
                let totalTime = 0;
                const tabCount = allTabs.length; // Count of currently open tabs (real-time)

                // Calculate total time spent browsing
                if (result.browsing_history && result.browsing_history.length > 0) {
                  totalTime = result.browsing_history.reduce(
                    (sum: number, session: any) => sum + (session.durationOnTab || 0),
                    0
                  );
                }

                setSessionData({
                  currentPage: currentTab.title || "—",
                  totalTabsVisited: tabCount,
                  timeSpentBrowsing: Math.floor(totalTime / 60), // convert to minutes
                  adsDetected: result.metrics?.potentialAdsDetected || 0,
                });

                // Generate insights
                generateInsights(result, tabCount);
              }
            });
          });

          if (result.preferences) {
            setFeatures(result.preferences);
          }
        }
      );
    };

    loadSessionData();
    const interval = setInterval(loadSessionData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * Generate meaningful insights from browsing data
   */
  const generateInsights = (result: any, tabCount: number) => {
    const newInsights: string[] = [];

    if (tabCount > 15) {
      newInsights.push("💡 You're juggling many tabs! Consider focusing on one topic.");
    }

    if (result.browsing_history && result.browsing_history.length > 0) {
      const avgTabDuration = result.browsing_history.reduce(
        (sum: number, s: any) => sum + (s.durationOnTab || 0),
        0
      ) / result.browsing_history.length;

      if (avgTabDuration > 300) {
        newInsights.push("✅ Great focus! You spend quality time on each page.");
      } else if (avgTabDuration < 30) {
        newInsights.push("⚡ Quick browser! You're jumping between pages rapidly.");
      }
    }

    if (result.metrics?.potentialAdsDetected > 5) {
      newInsights.push(`🛡️ Blocked ${result.metrics.potentialAdsDetected} ads on this page.`);
    }

    if (newInsights.length === 0) {
      newInsights.push("👋 Keep browsing! ALRA learns your patterns over time.");
    }

    setInsights(newInsights);
  };

  /**
   * Step 3: Handle feature toggle changes
   */
  const handleFeatureToggle = (feature: keyof typeof features) => {
    const newFeatures = { ...features, [feature]: !features[feature] };
    setFeatures(newFeatures);

    // Save to Chrome Storage
    chrome.storage.local.set({ preferences: newFeatures });

    // Notify background script
    chrome.runtime.sendMessage({
      type: "PREFERENCES_CHANGED",
      data: newFeatures,
    }).catch(() => {
      // Silently ignore errors (extension context may have changed)
    });
  };

  return (
    <div className="w-96 max-h-screen bg-white p-6 flex flex-col gap-5 overflow-y-auto">
      {/* HEADER - Modern Clean */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ALRA</h1>
          <p className="text-sm text-gray-500 font-medium">AI-Powered Browsing</p>
        </div>
        <div className="text-xs px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 font-semibold">
          Live
        </div>
      </div>

      {/* CURRENT PAGE INFO - Modern Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">📄 Current Page</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{sessionData.currentPage}</p>
      </div>

      {/* BROWSING INSIGHTS CARDS - Modern Gradient Cards */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">📊 Your Session</p>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Tabs Open (Real-time) */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-blue-600 font-medium">Open</p>
            <p className="text-2xl font-bold text-blue-700">{sessionData.totalTabsVisited}</p>
          </div>

          {/* Time Spent */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-purple-600 font-medium">Time</p>
            <p className="text-2xl font-bold text-purple-700">{sessionData.timeSpentBrowsing}m</p>
          </div>

          {/* Ads Detected */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-orange-600 font-medium">Ads</p>
            <p className="text-2xl font-bold text-orange-700">{sessionData.adsDetected}</p>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS - Modern Cards */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">💡 Insights</p>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 shadow-sm text-sm text-gray-700 leading-relaxed"
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* FEATURE TOGGLES - Modern Switches */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">⚙️ Features</p>

        <div className="space-y-2">
          {/* Page Optimization Toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-sm text-gray-700 font-medium">📄 Page Optimization</span>
            <button
              onClick={() => handleFeatureToggle("pageOptimization")}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${
                features.pageOptimization ? "bg-blue-600" : "bg-gray-300"
              } relative`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                features.pageOptimization ? "right-1" : "left-1"
              } shadow-md`} />
            </button>
          </div>

          {/* Summarization Toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-sm text-gray-700 font-medium">✂️ Summarization</span>
            <button
              onClick={() => handleFeatureToggle("summarization")}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${
                features.summarization ? "bg-blue-600" : "bg-gray-300"
              } relative`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                features.summarization ? "right-1" : "left-1"
              } shadow-md`} />
            </button>
          </div>

          {/* Predictions Toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-sm text-gray-700 font-medium">🔮 Predictions</span>
            <button
              onClick={() => handleFeatureToggle("predictions")}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${
                features.predictions ? "bg-blue-600" : "bg-gray-300"
              } relative`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                features.predictions ? "right-1" : "left-1"
              } shadow-md`} />
            </button>
          </div>

          {/* Nudges Toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-sm text-gray-700 font-medium">💡 Nudges</span>
            <button
              onClick={() => handleFeatureToggle("nudges")}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${
                features.nudges ? "bg-blue-600" : "bg-gray-300"
              } relative`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                features.nudges ? "right-1" : "left-1"
              } shadow-md`} />
            </button>
          </div>
        </div>
      </div>

      {/* STATUS FOOTER - Modern */}
      <div className="text-center text-xs text-gray-400 mt-2 pt-4 border-t border-gray-100 font-medium">
        ✨ ALRA is monitoring your browsing
      </div>
    </div>
  );
}

/**
 * Step 4: Mount React app to DOM
 * Creates root element and renders the App component
 */
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
