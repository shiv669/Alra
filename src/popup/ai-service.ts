/**
 * AI Service for Chrome Extension Popup
 * 
 * Handles all Chrome AI API interactions
 * This runs in the popup context where window.ai is available
 */

interface AICapabilities {
  summarizer: boolean;
  languageModel: boolean;
  writer: boolean;
  rewriter: boolean;
}

let capabilities: AICapabilities = {
  summarizer: false,
  languageModel: false,
  writer: false,
  rewriter: false,
};

let summarizerSession: any = null;
let languageModelSession: any = null;
let writerSession: any = null;

/**
 * Initialize Chrome AI APIs from popup context
 */
export async function initializeAIAPIs(): Promise<AICapabilities> {
  console.log("🤖 ALRA Popup: Initializing Chrome AI APIs...");
  console.log("🔍 Debug - window exists:", typeof window !== 'undefined');
  console.log("🔍 Debug - window.ai exists:", 'ai' in window);
  console.log("🔍 Debug - self.ai exists:", 'ai' in self);
  console.log("🔍 Debug - globalThis.ai exists:", 'ai' in globalThis);
  console.log("🔍 Debug - location:", window.location.href);
  console.log("🔍 Debug - isSecureContext:", window.isSecureContext);

  try {
    // Check if window.ai is available
    if (!('ai' in window)) {
      console.log("⚠️ ALRA: window.ai not available in popup");
      console.log("🔍 Checking what's in window:", Object.keys(window).filter(k => k.includes('ai') || k.includes('AI')));
      
      // Try alternative namespaces
      if ('chrome' in window && 'aiOriginTrial' in (window as any).chrome) {
        console.log("✅ Found chrome.aiOriginTrial!");
        const ai = (window as any).chrome.aiOriginTrial;
        // Try using this namespace
      }
      
      return capabilities;
    }

    const ai = (window as any).ai;
    console.log("✅ window.ai found! Properties:", Object.keys(ai));

    // Initialize Summarizer API
    if ('summarizer' in ai) {
      try {
        const summarizerCaps = await ai.summarizer.capabilities();
        console.log("📊 Summarizer capabilities:", summarizerCaps);
        
        if (summarizerCaps.available === "readily") {
          summarizerSession = await ai.summarizer.create({
            type: "key-points",
            format: "markdown",
            length: "medium",
          });
          capabilities.summarizer = true;
          console.log("✅ Summarizer API ready");
        }
      } catch (e) {
        console.log("⚠️ Summarizer init failed:", e);
      }
    }

    // Initialize Language Model (Prompt API)
    if ('languageModel' in ai) {
      try {
        const lmCaps = await ai.languageModel.capabilities();
        console.log("🧠 Language Model capabilities:", lmCaps);
        
        if (lmCaps.available === "readily") {
          languageModelSession = await ai.languageModel.create();
          capabilities.languageModel = true;
          console.log("✅ Language Model ready");
        }
      } catch (e) {
        console.log("⚠️ Language Model init failed:", e);
      }
    }

    // Initialize Writer/Rewriter API
    if ('rewriter' in ai) {
      try {
        const writerCaps = await ai.rewriter.capabilities();
        console.log("✍️ Rewriter capabilities:", writerCaps);
        
        if (writerCaps.available === "readily") {
          writerSession = await ai.rewriter.create();
          capabilities.writer = true;
          console.log("✅ Writer API ready");
        }
      } catch (e) {
        console.log("⚠️ Writer init failed:", e);
      }
    }

  } catch (error) {
    console.error("❌ AI initialization error:", error);
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧠 ALRA: AI APIs Status (Popup):");
  console.log(`   Summarizer:  ${capabilities.summarizer ? "✅" : "❌"}`);
  console.log(`   Language Model: ${capabilities.languageModel ? "✅" : "❌"}`);
  console.log(`   Writer:      ${capabilities.writer ? "✅" : "❌"}`);
  console.log("═══════════════════════════════════════════════════════════════");

  return capabilities;
}

/**
 * Summarize text using Chrome Summarizer API
 */
export async function summarizeText(text: string): Promise<string | null> {
  if (!capabilities.summarizer || !summarizerSession) {
    console.log("⚠️ Summarizer not available");
    return null;
  }

  try {
    const summary = await summarizerSession.summarize(text);
    console.log("✅ Text summarized successfully");
    return summary;
  } catch (error) {
    console.error("❌ Summarization failed:", error);
    return null;
  }
}

/**
 * Generate text using Language Model
 */
export async function generateText(prompt: string): Promise<string | null> {
  if (!capabilities.languageModel || !languageModelSession) {
    console.log("⚠️ Language Model not available");
    return null;
  }

  try {
    const response = await languageModelSession.prompt(prompt);
    console.log("✅ Text generated successfully");
    return response;
  } catch (error) {
    console.error("❌ Generation failed:", error);
    return null;
  }
}

/**
 * Rewrite text using Writer API
 */
export async function rewriteText(text: string, tone?: string): Promise<string | null> {
  if (!capabilities.writer || !writerSession) {
    console.log("⚠️ Writer not available");
    return null;
  }

  try {
    const rewritten = await writerSession.rewrite(text);
    console.log("✅ Text rewritten successfully");
    return rewritten;
  } catch (error) {
    console.error("❌ Rewriting failed:", error);
    return null;
  }
}

/**
 * Get current AI capabilities status
 */
export function getCapabilities(): AICapabilities {
  return { ...capabilities };
}

// Message listener for requests from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SUMMARIZE_TEXT_POPUP") {
    summarizeText(request.text).then(summary => {
      sendResponse({ success: true, summary });
    });
    return true; // Will respond asynchronously
  }

  if (request.action === "GENERATE_TEXT_POPUP") {
    generateText(request.prompt).then(text => {
      sendResponse({ success: true, text });
    });
    return true;
  }

  if (request.action === "GET_AI_CAPABILITIES_POPUP") {
    sendResponse({ success: true, capabilities: getCapabilities() });
    return true;
  }
});
