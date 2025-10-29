/**
 * Injected AI Bridge Script
 * 
 * This script runs in the ACTUAL PAGE CONTEXT (not content script isolated world)
 * It has access to window.ai and bridges it to the content script via CustomEvents
 */

(function() {
  console.log("🌉 ALRA AI Bridge: Injected into page context");
  console.log("🔍 window.ai available:", 'ai' in window);

  const aiAvailable = 'ai' in window;
  
  if (!aiAvailable) {
    console.log("⚠️ ALRA AI Bridge: window.ai not available on this page");
    
    // Still listen for availability checks
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'ALRA_AI_REQUEST' && event.data?.action === 'CHECK_AVAILABILITY') {
        window.postMessage({
          type: 'ALRA_AI_RESPONSE',
          id: event.data.id,
          result: 'unavailable',
          error: null
        }, '*');
      }
    });
    return;
  }

  // Check for Summarizer API (Chrome 138+)
  const summarizerAvailable = 'Summarizer' in self;
  const proofreaderAvailable = 'Proofreader' in self;
  
  const ai = (window as any).ai;
  console.log("✅ ALRA AI Bridge: window.ai found! Initializing...");
  console.log("📋 Summarizer API available:", summarizerAvailable);
  console.log("📝 Proofreader API available:", proofreaderAvailable);

  // Listen for requests from content script
  window.addEventListener('message', async (event) => {
    if (event.data?.type !== 'ALRA_AI_REQUEST') return;
    
    const { action, data, id } = event.data;
    console.log(`📨 ALRA AI Bridge: Received request ${action}`);

    try {
      let result = null;

      // Check AI availability
      if (action === 'CHECK_AVAILABILITY') {
        result = 'available';
        console.log("✅ ALRA AI Bridge: AI is available");
      }

      else if (action === 'SUMMARIZE') {
        // Use Summarizer API (Chrome 138+)
        if (summarizerAvailable) {
          const Summarizer = (self as any).Summarizer;
          const availability = await Summarizer.availability();
          
          if (availability === 'unavailable') {
            throw new Error('Summarizer API is not available');
          }
          
          const summarizer = await Summarizer.create({
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            monitor(m: any) {
              m.addEventListener('downloadprogress', (e: any) => {
                console.log(`Summarizer downloaded ${e.loaded * 100}%`);
              });
            }
          });
          result = await summarizer.summarize(data.text);
          console.log("✅ ALRA AI Bridge: Summarization complete (Summarizer API)");
        } else if ('summarizer' in ai) {
          // Fallback to old API
          const summarizer = await ai.summarizer.create({
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
          });
          result = await summarizer.summarize(data.text);
          console.log("✅ ALRA AI Bridge: Summarization complete (legacy API)");
        } else {
          throw new Error('No summarizer available');
        }
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

      else if (action === 'ANALYZE_IMAGE') {
        // Use Prompt API with image input (multimodal)
        if ('languageModel' in ai) {
          const session = await ai.languageModel.create({
            systemPrompt: 'You are an expert at analyzing images and providing detailed descriptions.'
          });
          
          // Convert base64 to blob if needed
          const imageData = data.image;
          
          result = await session.prompt(data.prompt, {
            image: imageData  // Multimodal input
          });
          console.log("✅ ALRA AI Bridge: Image analysis complete");
        } else {
          throw new Error('Multimodal Prompt API not available');
        }
      }

      else if (action === 'ANALYZE_VIDEO') {
        // Analyze video context using Prompt API
        if ('languageModel' in ai) {
          const session = await ai.languageModel.create();
          result = await session.prompt(data.prompt + '\n\n' + data.context);
          console.log("✅ ALRA AI Bridge: Video analysis complete");
        } else {
          throw new Error('Language Model not available');
        }
      }

      else if (action === 'PROOFREAD') {
        // Use Proofreader API (Chrome 141+) or language model
        if (proofreaderAvailable) {
          const Proofreader = (self as any).Proofreader;
          const availability = await Proofreader.availability();
          
          if (availability === 'unavailable') {
            // Fallback to language model
            if ('languageModel' in ai) {
              const session = await ai.languageModel.create();
              result = await session.prompt(`Proofread and correct this text:\n\n${data.text}`);
              console.log("✅ ALRA AI Bridge: Proofreading complete (language model fallback)");
            } else {
              throw new Error('No proofreading available');
            }
          } else {
            const proofreader = await Proofreader.create({
              expectedInputLanguages: ['en'],
              monitor(m: any) {
                m.addEventListener('downloadprogress', (e: any) => {
                  console.log(`Proofreader downloaded ${e.loaded * 100}%`);
                });
              }
            });
            const proofreadResult = await proofreader.proofread(data.text);
            result = proofreadResult.corrected;
            console.log("✅ ALRA AI Bridge: Proofreading complete (Proofreader API)");
          }
        } else if ('languageModel' in ai) {
          // Fallback to language model
          const session = await ai.languageModel.create();
          result = await session.prompt(`Proofread and correct this text:\n\n${data.text}`);
          console.log("✅ ALRA AI Bridge: Proofreading complete (language model)");
        } else {
          throw new Error('Proofreading not available');
        }
      }

      else if (action === 'TRANSLATE') {
        // Use Translator API or language model
        if ('translator' in ai) {
          const translator = await ai.translator.create({
            sourceLanguage: 'en',
            targetLanguage: data.targetLang.toLowerCase()
          });
          result = await translator.translate(data.text);
          console.log("✅ ALRA AI Bridge: Translation complete (native API)");
        } else if ('languageModel' in ai) {
          // Fallback to language model
          const session = await ai.languageModel.create();
          result = await session.prompt(data.prompt);
          console.log("✅ ALRA AI Bridge: Translation complete (language model)");
        } else {
          throw new Error('Translation not available');
        }
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
      window.postMessage({
        type: 'ALRA_AI_RESPONSE',
        id: id,
        result: result,
        error: null
      }, '*');

    } catch (error) {
      console.error("❌ ALRA AI Bridge: Error processing request", error);
      window.postMessage({
        type: 'ALRA_AI_RESPONSE',
        id: id,
        result: null,
        error: String(error)
      }, '*');
    }
  });

  console.log("✅ ALRA AI Bridge: Ready and listening for requests");

})();
