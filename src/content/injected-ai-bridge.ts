/**
 * Injected AI Bridge Script
 * 
 * This script runs in the ACTUAL PAGE CONTEXT (not content script isolated world)
 * It has access to window.ai and bridges it to the content script via CustomEvents
 */

(function() {
  console.log("🌉 ALRA AI Bridge: Injected into page context");
  console.log("🔍 window.ai available:", 'ai' in window);

  if (!('ai' in window)) {
    console.log("⚠️ ALRA AI Bridge: window.ai not available on this page");
    return;
  }

  const ai = (window as any).ai;
  console.log("✅ ALRA AI Bridge: window.ai found! Initializing...");

  // Listen for requests from content script
  window.addEventListener('ALRA_AI_REQUEST', async (event: any) => {
    const { action, data, requestId } = event.detail;
    console.log(`📨 ALRA AI Bridge: Received request ${action}`);

    try {
      let result = null;

      if (action === 'SUMMARIZE') {
        // Create summarizer session and summarize
        const summarizer = await ai.summarizer.create({
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
        });
        result = await summarizer.summarize(data.text);
        console.log("✅ ALRA AI Bridge: Summarization complete");
      }

      else if (action === 'GENERATE_TEXT') {
        // Use language model
        const session = await ai.languageModel.create();
        result = await session.prompt(data.prompt);
        console.log("✅ ALRA AI Bridge: Text generation complete");
      }

      else if (action === 'WRITE') {
        // Use writer API for generating text
        if ('writer' in ai) {
          const writer = await ai.writer.create({
            tone: data.tone || 'casual',
            length: data.length || 'short'
          });
          result = await writer.write(data.prompt);
          console.log("✅ ALRA AI Bridge: Writing complete");
        } else {
          // Fallback to language model
          const session = await ai.languageModel.create();
          result = await session.prompt(data.prompt);
          console.log("✅ ALRA AI Bridge: Writing complete (via language model)");
        }
      }

      else if (action === 'REWRITE') {
        // Use rewriter
        const rewriter = await ai.rewriter.create();
        result = await rewriter.rewrite(data.text);
        console.log("✅ ALRA AI Bridge: Rewriting complete");
      }

      else if (action === 'CHECK_CAPABILITIES') {
        // Check what's available
        const capabilities: any = {};
        
        if ('summarizer' in ai) {
          try {
            const sumCaps = await ai.summarizer.capabilities();
            capabilities.summarizer = sumCaps.available;
          } catch (e) {
            capabilities.summarizer = 'no';
          }
        }
        
        if ('languageModel' in ai) {
          try {
            const lmCaps = await ai.languageModel.capabilities();
            capabilities.languageModel = lmCaps.available;
          } catch (e) {
            capabilities.languageModel = 'no';
          }
        }
        
        if ('writer' in ai) {
          try {
            const writerCaps = await ai.writer.capabilities();
            capabilities.writer = writerCaps.available;
          } catch (e) {
            capabilities.writer = 'no';
          }
        }
        
        if ('rewriter' in ai) {
          try {
            const rwCaps = await ai.rewriter.capabilities();
            capabilities.rewriter = rwCaps.available;
          } catch (e) {
            capabilities.rewriter = 'no';
          }
        }
        
        result = capabilities;
        console.log("✅ ALRA AI Bridge: Capabilities checked", capabilities);
      }

      // Send response back to content script
      window.dispatchEvent(new CustomEvent('ALRA_AI_RESPONSE', {
        detail: { requestId, success: true, result }
      }));

    } catch (error) {
      console.error("❌ ALRA AI Bridge: Error processing request", error);
      window.dispatchEvent(new CustomEvent('ALRA_AI_RESPONSE', {
        detail: { requestId, success: false, error: String(error) }
      }));
    }
  });

  // Notify content script that bridge is ready
  window.dispatchEvent(new CustomEvent('ALRA_AI_BRIDGE_READY'));
  console.log("✅ ALRA AI Bridge: Ready and listening for requests");

})();
