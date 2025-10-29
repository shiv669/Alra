/**
 * ALRA Multimodal AI - Wave Animation Version
 * 
 * Features beautiful blue wave animation instead of modals
 * Results appear inline on the page itself
 */

export class MultimodalAI {
  private waveOverlay: HTMLElement | null = null;
  private resultContainer: HTMLElement | null = null;
  private isProcessing: boolean = false;
  private aiAvailable: boolean = false;

  constructor() {
    this.init();
    this.injectStyles();
    this.checkAIAvailability();
  }

  /**
   * Check if Gemini Nano AI is available
   */
  private async checkAIAvailability(): Promise<void> {
    try {
      // Wait for AI bridge to be injected
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.sendToAIBridge("CHECK_AVAILABILITY", {});
      this.aiAvailable = result === "available";
      
      if (!this.aiAvailable) {
        console.warn("ALRA: Gemini Nano AI not available. Multimodal features will show fallback.");
      }
    } catch (error) {
      this.aiAvailable = false;
      console.warn("ALRA: Could not check AI availability:", error);
    }
  }

  private init(): void {
    // Add context menu listener for images
    document.addEventListener("contextmenu", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        (window as any).__alraContextImage = target;
      }
    });
  }

  private injectStyles(): void {
    if (document.querySelector("#alra-wave-styles")) return;

    const style = document.createElement("style");
    style.id = "alra-wave-styles";
    style.textContent = `
      /* Wave Animation Overlay */
      .alra-wave-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483646;
        overflow: hidden;
      }

      .alra-wave {
        position: absolute;
        width: 200%;
        height: 200%;
        top: -50%;
        left: -50%;
        background: radial-gradient(
          circle at center,
          rgba(59, 130, 246, 0.4) 0%,
          rgba(59, 130, 246, 0.2) 30%,
          rgba(59, 130, 246, 0.1) 60%,
          transparent 100%
        );
        animation: alra-wave-pulse 2s ease-in-out infinite;
      }

      .alra-wave-1 { animation-delay: 0s; }
      .alra-wave-2 { animation-delay: 0.4s; }
      .alra-wave-3 { animation-delay: 0.8s; }

      @keyframes alra-wave-pulse {
        0% {
          transform: scale(0.8) rotate(0deg);
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          transform: scale(1.3) rotate(180deg);
          opacity: 0;
        }
      }

      .alra-wave-overlay.alra-wave-fadeout .alra-wave {
        animation: alra-wave-fadeout 0.8s ease-out forwards;
      }

      @keyframes alra-wave-fadeout {
        to {
          opacity: 0;
          transform: scale(1.5);
        }
      }

      /* Inline Result Container */
      .alra-result-container {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 450px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 2147483645;
        animation: alra-result-slidein 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      @keyframes alra-result-slidein {
        from {
          transform: translateX(500px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .alra-result-container.alra-result-fadeout {
        animation: alra-result-fadeout 0.4s ease-out forwards;
      }

      @keyframes alra-result-fadeout {
        to {
          transform: translateX(500px);
          opacity: 0;
        }
      }

      .alra-result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .alra-result-title {
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .alra-result-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .alra-result-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .alra-result-content {
        font-size: 14px;
        line-height: 1.6;
        max-height: 400px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.1);
        padding: 16px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      .alra-result-content::-webkit-scrollbar {
        width: 8px;
      }

      .alra-result-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .alra-result-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }

      .alra-result-actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
      }

      .alra-result-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
        flex: 1;
      }

      .alra-result-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      /* Quick Action Menu */
      .alra-quick-menu {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: white;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 2147483645;
        animation: alra-menu-popup 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        min-width: 280px;
      }

      @keyframes alra-menu-popup {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .alra-quick-menu-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #1f2937;
      }

      .alra-quick-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
        background: #f3f4f6;
      }

      .alra-quick-menu-item:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateX(4px);
      }

      .alra-quick-menu-item:last-child {
        margin-bottom: 0;
      }

      .alra-quick-menu-icon {
        font-size: 24px;
      }

      .alra-quick-menu-text {
        flex: 1;
      }

      .alra-quick-menu-label {
        font-weight: 600;
        font-size: 14px;
      }

      .alra-quick-menu-desc {
        font-size: 12px;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show the blue wave animation
   */
  private showWaveAnimation(): void {
    this.hideWaveAnimation();

    this.waveOverlay = document.createElement("div");
    this.waveOverlay.className = "alra-wave-overlay";
    this.waveOverlay.innerHTML = `
      <div class="alra-wave alra-wave-1"></div>
      <div class="alra-wave alra-wave-2"></div>
      <div class="alra-wave alra-wave-3"></div>
    `;
    document.body.appendChild(this.waveOverlay);
  }

  /**
   * Hide wave animation with smooth fadeout
   */
  private hideWaveAnimation(): Promise<void> {
    return new Promise((resolve) => {
      if (this.waveOverlay) {
        this.waveOverlay.classList.add("alra-wave-fadeout");
        setTimeout(() => {
          this.waveOverlay?.remove();
          this.waveOverlay = null;
          resolve();
        }, 800);
      } else {
        resolve();
      }
    });
  }

  /**
   * Show result inline on the page
   */
  private showResult(title: string, content: string, icon: string = "🤖"): void {
    // Remove existing result
    this.hideResult();

    this.resultContainer = document.createElement("div");
    this.resultContainer.className = "alra-result-container";
    this.resultContainer.innerHTML = `
      <div class="alra-result-header">
        <div class="alra-result-title">
          <span>${icon}</span>
          <span>${title}</span>
        </div>
        <button class="alra-result-close">×</button>
      </div>
      <div class="alra-result-content">${content}</div>
      <div class="alra-result-actions">
        <button class="alra-result-btn alra-copy-btn">📋 Copy</button>
        <button class="alra-result-btn alra-share-btn">🔗 Share</button>
      </div>
    `;

    // Event listeners
    const closeBtn = this.resultContainer.querySelector(".alra-result-close");
    closeBtn?.addEventListener("click", () => this.hideResult());

    const copyBtn = this.resultContainer.querySelector(".alra-copy-btn");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(content);
      (copyBtn as HTMLElement).textContent = "✓ Copied!";
      setTimeout(() => {
        (copyBtn as HTMLElement).textContent = "📋 Copy";
      }, 2000);
    });

    const shareBtn = this.resultContainer.querySelector(".alra-share-btn");
    shareBtn?.addEventListener("click", async () => {
      try {
        await navigator.share({ text: content, title });
        (shareBtn as HTMLElement).textContent = "✓ Shared!";
      } catch (e) {
        console.log("Share not supported");
      }
    });

    document.body.appendChild(this.resultContainer);

    // Auto-hide after 30 seconds
    setTimeout(() => this.hideResult(), 30000);
  }

  /**
   * Hide result container
   */
  private hideResult(): Promise<void> {
    return new Promise((resolve) => {
      if (this.resultContainer) {
        this.resultContainer.classList.add("alra-result-fadeout");
        setTimeout(() => {
          this.resultContainer?.remove();
          this.resultContainer = null;
          resolve();
        }, 400);
      } else {
        resolve();
      }
    });
  }

  /**
   * Show fallback message when AI is not available
   */
  private showFallbackMessage(): void {
    this.showResult(
      "⚠️ AI Not Available",
      `<div style="text-align: center;">
        <p style="margin-bottom: 12px;">Gemini Nano AI is not currently available in your browser.</p>
        <p style="font-size: 13px; opacity: 0.9; margin-bottom: 12px;">To enable ALRA's AI features:</p>
        <ol style="text-align: left; font-size: 13px; opacity: 0.9; line-height: 1.8;">
          <li>Use <strong>Chrome Canary</strong> or <strong>Chrome Dev</strong> (version 127+)</li>
          <li>Go to <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">chrome://flags</code></li>
          <li>Enable these flags:
            <ul style="margin-top: 6px;">
              <li><code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">Prompt API for Gemini Nano</code></li>
              <li><code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">Summarization API for Gemini Nano</code></li>
            </ul>
          </li>
          <li>Restart Chrome</li>
          <li>Go to <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">chrome://components</code></li>
          <li>Find "Optimization Guide On Device Model" and click <strong>Check for update</strong></li>
          <li>Wait for Gemini Nano to download (~1.7GB)</li>
        </ol>
        <p style="font-size: 13px; opacity: 0.9; margin-top: 12px;">Once enabled, ALRA will have access to powerful on-device AI! 🚀</p>
      </div>`,
      "⚠️"
    );
  }

  /**
   * Analyze an image using Prompt API multimodal input
   */
  async summarizeImage(imageElement?: HTMLImageElement): Promise<void> {
    if (this.isProcessing) return;

    // Check AI availability first
    if (!this.aiAvailable) {
      this.showFallbackMessage();
      return;
    }

    const img = imageElement || (window as any).__alraContextImage;
    if (!img) {
      this.showResult("Error", "No image found. Please right-click on an image first.", "⚠️");
      return;
    }

    try {
      this.isProcessing = true;
      this.showWaveAnimation();

      // Convert image to blob
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      // Send to AI bridge
      const result = await this.sendToAIBridge("ANALYZE_IMAGE", {
        prompt: "Analyze this image in detail. Describe what you see, identify key elements, and provide insights about the context, purpose, or meaning.",
        imageBlob: blob,
      });

      await this.hideWaveAnimation();
      this.showResult("🖼️ Image Analysis", result, "🖼️");
    } catch (error) {
      await this.hideWaveAnimation();
      this.showResult("Error", `Failed to analyze image: ${error}`, "⚠️");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Summarize a YouTube video
   */
  async summarizeYouTubeVideo(): Promise<void> {
    if (this.isProcessing) return;

    // Check AI availability first
    if (!this.aiAvailable) {
      this.showFallbackMessage();
      return;
    }

    if (!window.location.hostname.includes("youtube.com")) {
      this.showResult("Error", "This feature only works on YouTube pages.", "⚠️");
      return;
    }

    try {
      this.isProcessing = true;
      this.showWaveAnimation();

      // Extract video info
      const title = document.querySelector("h1.ytd-video-primary-info-renderer")?.textContent?.trim() ||
                   document.querySelector("h1 yt-formatted-string")?.textContent?.trim() ||
                   "Unknown Video";

      const description = document.querySelector("#description-inline-expander")?.textContent?.trim()?.substring(0, 500) ||
                         "No description available";

      const videoId = new URLSearchParams(window.location.search).get("v");
      const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";

      const context = `
Video Title: ${title}
Description: ${description}
Thumbnail: ${thumbnail}
`;

      const result = await this.sendToAIBridge("ANALYZE_VIDEO", {
        prompt: "Based on this YouTube video information, provide: 1) A concise summary, 2) Key topics covered, 3) Target audience, 4) Main takeaways, 5) Educational or entertainment value.",
        context,
      });

      await this.hideWaveAnimation();
      this.showResult("🎥 Video Summary", result, "🎥");
    } catch (error) {
      await this.hideWaveAnimation();
      this.showResult("Error", `Failed to summarize video: ${error}`, "⚠️");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Proofread selected text
   */
  async proofreadText(text?: string): Promise<void> {
    if (this.isProcessing) return;

    // Check AI availability first
    if (!this.aiAvailable) {
      this.showFallbackMessage();
      return;
    }

    const selectedText = text || window.getSelection()?.toString().trim();
    if (!selectedText) {
      this.showResult("Error", "Please select some text first.", "⚠️");
      return;
    }

    try {
      this.isProcessing = true;
      this.showWaveAnimation();

      const result = await this.sendToAIBridge("PROOFREAD", { text: selectedText });

      await this.hideWaveAnimation();
      this.showResult("📝 Proofread Text", result, "📝");
    } catch (error) {
      await this.hideWaveAnimation();
      this.showResult("Error", `Failed to proofread: ${error}`, "⚠️");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Translate selected text
   */
  async translateText(text?: string, targetLang: string = "es"): Promise<void> {
    if (this.isProcessing) return;

    // Check AI availability first
    if (!this.aiAvailable) {
      this.showFallbackMessage();
      return;
    }

    const selectedText = text || window.getSelection()?.toString().trim();
    if (!selectedText) {
      this.showResult("Error", "Please select some text first.", "⚠️");
      return;
    }

    try {
      this.isProcessing = true;
      this.showWaveAnimation();

      const result = await this.sendToAIBridge("TRANSLATE", {
        text: selectedText,
        targetLanguage: targetLang,
        sourceLanguage: "en",
      });

      await this.hideWaveAnimation();
      this.showResult(`🌐 Translation (${targetLang.toUpperCase()})`, result, "🌐");
    } catch (error) {
      await this.hideWaveAnimation();
      this.showResult("Error", `Failed to translate: ${error}`, "⚠️");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Show quick actions menu
   */
  async showQuickActions(): Promise<void> {
    // Remove existing menu
    const existingMenu = document.querySelector(".alra-quick-menu");
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement("div");
    menu.className = "alra-quick-menu";

    const isYouTube = window.location.hostname.includes("youtube.com");
    const hasSelection = !!window.getSelection()?.toString().trim();
    const hasImage = !!(window as any).__alraContextImage;

    let menuItems = `<div class="alra-quick-menu-title">🤖 Multimodal AI</div>`;

    if (hasImage) {
      menuItems += `
        <div class="alra-quick-menu-item" data-action="image">
          <div class="alra-quick-menu-icon">🖼️</div>
          <div class="alra-quick-menu-text">
            <div class="alra-quick-menu-label">Analyze Image</div>
            <div class="alra-quick-menu-desc">Get AI insights</div>
          </div>
        </div>
      `;
    }

    if (isYouTube) {
      menuItems += `
        <div class="alra-quick-menu-item" data-action="video">
          <div class="alra-quick-menu-icon">🎥</div>
          <div class="alra-quick-menu-text">
            <div class="alra-quick-menu-label">Summarize Video</div>
            <div class="alra-quick-menu-desc">Key topics & takeaways</div>
          </div>
        </div>
      `;
    }

    if (hasSelection) {
      menuItems += `
        <div class="alra-quick-menu-item" data-action="proofread">
          <div class="alra-quick-menu-icon">📝</div>
          <div class="alra-quick-menu-text">
            <div class="alra-quick-menu-label">Proofread Text</div>
            <div class="alra-quick-menu-desc">Fix grammar & clarity</div>
          </div>
        </div>
        <div class="alra-quick-menu-item" data-action="translate">
          <div class="alra-quick-menu-icon">🌐</div>
          <div class="alra-quick-menu-text">
            <div class="alra-quick-menu-label">Translate</div>
            <div class="alra-quick-menu-desc">To Spanish</div>
          </div>
        </div>
      `;
    }

    if (menuItems === `<div class="alra-quick-menu-title">🤖 Multimodal AI</div>`) {
      this.showResult(
        "Quick Actions",
        "Right-click an image, visit YouTube, or select text to see available actions.",
        "💡"
      );
      return;
    }

    menu.innerHTML = menuItems;

    // Event listeners
    menu.querySelectorAll(".alra-quick-menu-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const action = item.getAttribute("data-action");
        menu.remove();

        if (action === "image") await this.summarizeImage();
        else if (action === "video") await this.summarizeYouTubeVideo();
        else if (action === "proofread") await this.proofreadText();
        else if (action === "translate") await this.translateText();
      });
    });

    document.body.appendChild(menu);

    // Auto-hide after 10 seconds
    setTimeout(() => menu.remove(), 10000);

    // Close on click outside
    setTimeout(() => {
      const clickHandler = (e: MouseEvent) => {
        if (!menu.contains(e.target as Node)) {
          menu.remove();
          document.removeEventListener("click", clickHandler);
        }
      };
      document.addEventListener("click", clickHandler);
    }, 100);
  }

  /**
   * Setup context menu listeners
   */
  private setupContextMenuListeners(): void {
    // This would integrate with Chrome's context menu API
    // For now, we rely on the FAB menu and keyboard shortcuts
  }

  /**
   * Send request to AI bridge
   */
  private async sendToAIBridge(action: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const messageId = `alra-ai-${Date.now()}-${Math.random()}`;

      const responseHandler = (event: MessageEvent) => {
        if (event.data?.id === messageId) {
          window.removeEventListener("message", responseHandler);
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener("message", responseHandler);

      // Convert blob to base64 if present
      if (data.imageBlob) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          window.postMessage(
            {
              type: "ALRA_AI_REQUEST",
              id: messageId,
              action,
              data: { ...data, imageData: base64, imageBlob: undefined },
            },
            "*"
          );
        };
        reader.readAsDataURL(data.imageBlob);
      } else {
        window.postMessage(
          {
            type: "ALRA_AI_REQUEST",
            id: messageId,
            action,
            data,
          },
          "*"
        );
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener("message", responseHandler);
        reject("AI request timed out");
      }, 30000);
    });
  }
}
