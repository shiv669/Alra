/**
 * ALRA Multimodal AI
 * 
 * Uses Chrome's Prompt API with multimodal support to:
 * - Summarize images and screenshots
 * - Analyze YouTube videos
 * - Proofread and translate selected text
 */

export class MultimodalAI {
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isProcessing: boolean = false;

  constructor() {
    this.createModal();
    this.setupContextMenuListeners();
  }

  private createModal(): void {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2147483646;
      display: none;
      animation: fadeIn 0.2s ease-out;
    `;

    // Modal
    this.modal = document.createElement('div');
    this.modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: none;
    `;

    // Click overlay to close
    this.overlay.onclick = () => this.hide();

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInModal {
        from {
          opacity: 0;
          transform: translate(-50%, -48%) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
        50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  private setupContextMenuListeners(): void {
    // Listen for right-click on images
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        // Store the clicked image for later
        (window as any).alraLastClickedImage = target;
      }
    });
  }

  async summarizeImage(imageElement?: HTMLImageElement): Promise<void> {
    let img = imageElement;
    
    // If no image provided, try to find one
    if (!img) {
      img = (window as any).alraLastClickedImage;
      if (!img) {
        // Find the largest image on the page
        const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
        img = images.reduce((largest, current) => {
          const largestArea = (largest?.width || 0) * (largest?.height || 0);
          const currentArea = current.width * current.height;
          return currentArea > largestArea ? current : largest;
        }, images[0]);
      }
    }

    if (!img || !img.src) {
      this.showError('No image found to analyze');
      return;
    }

    await this.show();
    this.showLoading('Analyzing image with Gemini Nano...');

    try {
      // Convert image to blob
      const blob = await this.imageToBlob(img);
      
      // Use Prompt API with image input
      const result = await this.analyzeImageWithPromptAPI(blob, img.alt || '');
      
      this.showResult('🖼️ Image Analysis', result, img.src);
    } catch (error) {
      console.error('❌ ALRA: Image analysis failed:', error);
      this.showError('Could not analyze image. Make sure Gemini Nano is available.');
    }
  }

  async summarizeYouTubeVideo(): Promise<void> {
    const url = window.location.href;
    
    if (!url.includes('youtube.com/watch')) {
      this.showError('This feature only works on YouTube videos');
      return;
    }

    await this.show();
    this.showLoading('Analyzing YouTube video with Gemini Nano...');

    try {
      // Extract video title and description
      const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() || 
                        document.querySelector('yt-formatted-string.ytd-watch-metadata')?.textContent?.trim() || 
                        document.title;
      
      // Get video thumbnail
      const thumbnail = document.querySelector('video')?.poster || 
                       document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

      // Try to get transcript button or description
      const description = document.querySelector('#description-inline-expander')?.textContent?.trim() || '';

      // Analyze video context
      const context = `Video Title: ${videoTitle}\n\nDescription: ${description.substring(0, 1000)}`;
      
      const result = await this.analyzeVideoWithPromptAPI(context, thumbnail);
      
      this.showResult('🎥 Video Summary', result, thumbnail);
    } catch (error) {
      console.error('❌ ALRA: Video analysis failed:', error);
      this.showError('Could not analyze video. Try again in a moment.');
    }
  }

  async proofreadText(text: string): Promise<void> {
    if (!text || text.trim().length === 0) {
      this.showError('No text selected to proofread');
      return;
    }

    await this.show();
    this.showLoading('Proofreading with Gemini Nano...');

    try {
      const result = await this.proofreadWithPromptAPI(text);
      this.showResult('📝 Proofread Text', result);
    } catch (error) {
      console.error('❌ ALRA: Proofreading failed:', error);
      this.showError('Could not proofread text. Make sure Gemini Nano is available.');
    }
  }

  async translateText(text: string, targetLang: string = 'Spanish'): Promise<void> {
    if (!text || text.trim().length === 0) {
      this.showError('No text selected to translate');
      return;
    }

    await this.show();
    this.showLoading(`Translating to ${targetLang} with Gemini Nano...`);

    try {
      const result = await this.translateWithPromptAPI(text, targetLang);
      this.showResult(`🌐 Translation to ${targetLang}`, result);
    } catch (error) {
      console.error('❌ ALRA: Translation failed:', error);
      this.showError('Could not translate text. Make sure Gemini Nano is available.');
    }
  }

  private async imageToBlob(img: HTMLImageElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Set canvas size to image size
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      // Handle CORS for external images
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      
      tempImg.onload = () => {
        ctx.drawImage(tempImg, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert image to blob'));
          }
        }, 'image/png');
      };

      tempImg.onerror = () => {
        // Fallback: try to fetch the image
        fetch(img.src)
          .then(res => res.blob())
          .then(resolve)
          .catch(reject);
      };

      tempImg.src = img.src;
    });
  }

  private async analyzeImageWithPromptAPI(imageBlob: Blob, altText: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `multimodal-image-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            resolve(customEvent.detail.result);
          } else {
            reject(new Error('Multimodal analysis failed'));
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        
        window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
          detail: {
            action: 'ANALYZE_IMAGE',
            data: {
              image: base64Image,
              altText: altText,
              prompt: `Analyze this image in detail. Describe what you see, identify key elements, and provide insights about the content. If there's text in the image, read and summarize it.`
            },
            requestId
          }
        }));
      };
      
      reader.readAsDataURL(imageBlob);
      
      // Timeout after 15 seconds
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        reject(new Error('Image analysis timeout'));
      }, 15000);
    });
  }

  private async analyzeVideoWithPromptAPI(context: string, thumbnail: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `multimodal-video-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            resolve(customEvent.detail.result);
          } else {
            reject(new Error('Video analysis failed'));
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'ANALYZE_VIDEO',
          data: {
            context: context,
            thumbnail: thumbnail,
            prompt: `Based on this YouTube video's title and description, provide:
1. A concise summary of what the video is about
2. Key topics covered
3. Who would benefit from watching this
4. Estimated educational value

Keep it clear and helpful.`
          },
          requestId
        }
      }));
      
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        reject(new Error('Video analysis timeout'));
      }, 15000);
    });
  }

  private async proofreadWithPromptAPI(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `proofread-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            resolve(customEvent.detail.result);
          } else {
            reject(new Error('Proofreading failed'));
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'PROOFREAD',
          data: {
            text: text,
            prompt: `Proofread and correct this text. Fix grammar, spelling, punctuation, and improve clarity. Return the corrected version:

"${text}"`
          },
          requestId
        }
      }));
      
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        reject(new Error('Proofreading timeout'));
      }, 10000);
    });
  }

  private async translateWithPromptAPI(text: string, targetLang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `translate-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            resolve(customEvent.detail.result);
          } else {
            reject(new Error('Translation failed'));
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'TRANSLATE',
          data: {
            text: text,
            targetLang: targetLang,
            prompt: `Translate this text to ${targetLang}. Provide only the translation:

"${text}"`
          },
          requestId
        }
      }));
      
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        reject(new Error('Translation timeout'));
      }, 10000);
    });
  }

  async show(): Promise<void> {
    if (!this.overlay || !this.modal) return;

    // Append to body if not already there
    if (!document.body.contains(this.overlay)) {
      document.body.appendChild(this.overlay);
    }
    if (!document.body.contains(this.modal)) {
      document.body.appendChild(this.modal);
    }

    this.overlay.style.display = 'block';
    this.modal.style.display = 'block';
    this.modal.style.animation = 'slideInModal 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  hide(): void {
    if (!this.overlay || !this.modal) return;

    this.overlay.style.display = 'none';
    this.modal.style.display = 'none';
    
    // Remove from DOM
    if (document.body.contains(this.overlay)) {
      this.overlay.remove();
    }
    if (document.body.contains(this.modal)) {
      this.modal.remove();
    }
  }

  private showLoading(message: string): void {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 24px; text-align: center;">
        <div style="font-size: 20px; font-weight: 700;">🤖 Multimodal AI</div>
      </div>
      <div style="padding: 60px 40px; text-align: center;">
        <div style="width: 80px; height: 80px; border: 4px solid #E5E7EB; border-top-color: #6366F1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
        <div style="font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">${message}</div>
        <div style="font-size: 14px; color: #6B7280;">Powered by Gemini Nano</div>
      </div>
    `;

    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);
  }

  private showResult(title: string, result: string, imageUrl?: string): void {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 20px; font-weight: 700;">${title}</div>
        <button id="alra-multimodal-close" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      ${imageUrl ? `<div style="padding: 20px; background: #F3F4F6; text-align: center;"><img src="${imageUrl}" style="max-width: 100%; max-height: 200px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></div>` : ''}
      <div style="padding: 28px; max-height: 400px; overflow-y: auto;">
        <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%); border-left: 4px solid #6366F1; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #6366F1; font-weight: 600; margin-bottom: 8px;">✨ GEMINI NANO ANALYSIS</div>
          <div style="font-size: 15px; line-height: 1.7; color: #1F2937; white-space: pre-wrap;">${result}</div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button id="alra-copy-result" style="flex: 1; padding: 12px; background: #6366F1; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            📋 Copy Result
          </button>
          <button id="alra-share-result" style="flex: 1; padding: 12px; background: white; color: #6366F1; border: 2px solid #6366F1; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            🔗 Share
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('#alra-multimodal-close')?.addEventListener('click', () => this.hide());
    this.modal.querySelector('#alra-copy-result')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(result);
      this.showToast('✅ Copied to clipboard!');
    });
    this.modal.querySelector('#alra-share-result')?.addEventListener('click', async () => {
      if (navigator.share) {
        await navigator.share({ text: result, title: title });
      } else {
        await navigator.clipboard.writeText(result);
        this.showToast('✅ Copied to clipboard! (Share not available)');
      }
    });
  }

  private showError(message: string): void {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 24px; text-align: center;">
        <div style="font-size: 20px; font-weight: 700;">⚠️ Error</div>
      </div>
      <div style="padding: 60px 40px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
        <div style="font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 12px;">${message}</div>
        <button id="alra-error-close" style="margin-top: 20px; padding: 12px 24px; background: #EF4444; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
          Close
        </button>
      </div>
    `;

    this.modal.querySelector('#alra-error-close')?.addEventListener('click', () => this.hide());
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
      padding: 14px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
      z-index: 2147483647;
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

  async showQuickActions(): Promise<void> {
    await this.show();
    
    if (!this.modal) return;

    // Check if on YouTube
    const isYouTube = window.location.href.includes('youtube.com/watch');
    
    // Get selected text
    const selectedText = window.getSelection()?.toString().trim() || '';

    this.modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">🤖 Multimodal AI</div>
          <div style="font-size: 13px; opacity: 0.9;">Choose an action</div>
        </div>
        <button id="alra-quick-close" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 24px;">×</button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 12px;">
          <button class="alra-action-btn" data-action="image" style="padding: 16px; background: linear-gradient(135deg, #F0F9FF 0%, #E0E7FF 100%); border: 2px solid #6366F1; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="font-size: 32px; margin-bottom: 8px;">🖼️</div>
            <div style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">Analyze Image</div>
            <div style="font-size: 13px; color: #6B7280;">Get AI description of any image on this page</div>
          </button>
          
          ${isYouTube ? `
          <button class="alra-action-btn" data-action="video" style="padding: 16px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="font-size: 32px; margin-bottom: 8px;">🎥</div>
            <div style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">Summarize Video</div>
            <div style="font-size: 13px; color: #6B7280;">Get AI summary of this YouTube video</div>
          </button>
          ` : ''}
          
          ${selectedText ? `
          <button class="alra-action-btn" data-action="proofread" style="padding: 16px; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 2px solid #10B981; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
            <div style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">Proofread Text</div>
            <div style="font-size: 13px; color: #6B7280;">Fix grammar and spelling in selected text</div>
          </button>
          
          <button class="alra-action-btn" data-action="translate" style="padding: 16px; background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); border: 2px solid #EC4899; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
            <div style="font-size: 32px; margin-bottom: 8px;">🌐</div>
            <div style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">Translate Text</div>
            <div style="font-size: 13px; color: #6B7280;">Translate selected text to another language</div>
          </button>
          ` : `
          <div style="padding: 16px; background: #F3F4F6; border-radius: 12px; text-align: center; color: #6B7280; font-size: 14px;">
            💡 Select text on the page to enable Proofread & Translate
          </div>
          `}
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('#alra-quick-close')?.addEventListener('click', () => this.hide());
    
    this.modal.querySelectorAll('.alra-action-btn').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.transform = 'translateY(-2px)';
        (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
      });
      btn.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.transform = 'translateY(0)';
        (e.target as HTMLElement).style.boxShadow = 'none';
      });
      btn.addEventListener('click', async (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.hide();
        
        if (action === 'image') {
          await this.summarizeImage();
        } else if (action === 'video') {
          await this.summarizeYouTubeVideo();
        } else if (action === 'proofread') {
          await this.proofreadText(selectedText);
        } else if (action === 'translate') {
          await this.translateText(selectedText);
        }
      });
    });
  }
}
