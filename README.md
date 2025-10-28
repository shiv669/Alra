# ALRA - Your AI Browser Companion 🚀# 🧠 ALRA – Chrome's AI-Powered Assistant Extension



> Built for the Google Chrome Built-in AI Challenge 2025> **"Predict. Clean. Guide. Make Chrome smarter."**



Hey there! 👋 Let me tell you about ALRA - a Chrome extension I built that actually makes browsing the web smarter, not more annoying.---



## What's This All About?## 🎯 What is ALRA?



You know how we all end up with like 50 tabs open, can't remember what we were reading, and waste time scrolling through cluttered websites? Yeah, I got tired of that too. ALRA is an intelligent **Chrome extension** that transforms your browsing experience by harnessing the power of AI to predict your needs, clean up cluttered web pages, summarize lengthy content, and guide your next actions — all **right inside your browser, offline, and privacy-first**.



So I built ALRA - it's like having a smart assistant that actually understands what you're doing online and helps you stay productive. The best part? Everything runs **locally on your device** using Google's Gemini Nano. No creepy cloud servers, no data harvesting, just you and your browser getting stuff done.Think of ALRA as your **personal browsing co-pilot** that works silently in the background, learning your habits and making your digital life faster, cleaner, and less overwhelming.



## The Real Problem I'm Solving---



Here's what drove me crazy about browsing:## 🚨 The Problems ALRA Solves



### 1. **Information Overload**### **Problem 1: Seamless Device & Tab Transitions**

I'd open a 10-minute article, spend 2 minutes scrolling past ads and junk, then forget what I was even reading about. Every. Single. Time.

📱 **The Issue:**

### 2. **Decision Fatigue** - You're researching on your laptop, open 10 tabs, then switch to your phone

"Should I read this now? Should I bookmark it? Where did I even see that link?" My brain was making hundreds of tiny decisions that just drained me.- Now you're lost — which tab was I reading? What was I looking for?

- Context and continuity are lost across devices

### 3. **Lost Context**

I'd research something on my laptop, then grab my phone and... complete blank. What was I doing? What tabs did I have open? Ugh.✨ **How ALRA Fixes It:**

- ALRA learns YOUR browsing patterns and **predicts which tab you'll need next**

### 4. **Privacy Concerns**- It intelligently preloads content and syncs your session securely across devices

Most "smart" tools want to send everything to their servers. My browsing history, my reading habits, everything. Hard pass.- Switching devices feels seamless — your next action is already waiting for you



So I thought: what if Chrome itself could be smarter? What if the browser just... helped you out, without being intrusive?---



## What ALRA Actually Does### **Problem 2: Inconsistent Site Rendering**



Let me show you the cool stuff:🗑️ **The Issue:**

- Websites are cluttered: ads everywhere, sidebars you don't care about, unreadable fonts

### ✨ AI-Powered Summaries- You waste time scrolling past junk to find the actual content

Long article? ALRA reads it with Gemini Nano and gives you the TL;DR. Like, actually useful bullet points, not just the first paragraph copy-pasted.- The same website looks different on different devices or browsers



**Example:** I was reading a 15-minute technical article about React hooks. ALRA summarized it in 3 key points in like 5 seconds. Saved me 10 minutes and I still got the important stuff.✨ **How ALRA Fixes It:**

- ALRA **reformats messy pages dynamically**, removing ads, clutter, and distractions

### 💡 Smart Suggestions- It highlights the **key information** you actually care about (headlines, images, tables)

Based on what you're reading, ALRA suggests what to do next. And I don't mean generic stuff - it actually analyzes the page and gives contextual suggestions.- Every page becomes clean, readable, and optimized instantly

- Works consistently across all websites

**Example:** Reading a GitHub repo? ALRA suggests: "⭐ Star this repository", "📖 Read the documentation", "💾 Clone this repository". Just helpful nudges when you need them.

---

### 📊 Productivity Tracking

Ever wonder how much time you actually save with these tools? ALRA tracks it. Time saved, articles summarized, tabs managed - real numbers, not marketing fluff.### **Problem 3: Overwhelming Workflow & Cognitive Load**



### 🔄 Cross-Device Sync🧠 **The Issue:**

This is my favorite. When you close tabs on your desktop, ALRA remembers what you were doing and syncs recommended next tabs through Chrome's native sync. Open Chrome on your phone, check "Recent Tabs", and boom - right where you left off. **No extension needed on mobile.**- You have 5 research papers open, 3 emails to respond to, multiple browser tabs with articles

- Your brain is overloaded deciding what to read first and what to do next

### 🎯 All From One Button- Time is wasted on decision fatigue, not actual work

Everything lives in a simple floating button. One click, see all your options. No cluttered UI, no toolbar spam, just a clean circle in the corner.

✨ **How ALRA Fixes It:**

## Why ALRA is Different- ALRA **summarizes long articles, emails, and documents inline** without you leaving the page

- It generates **actionable nudges** like:

**Most browser extensions:**  - *"💡 Read this article first — it's directly relevant"*

- Send your data to their servers  - *"✅ You need to complete this task next"*

- Add clutter everywhere  - *"📧 Follow up on this email"*

- Try to do too much and end up doing nothing well- Your workflow becomes guided and intentional, not chaotic

- Cost money or show ads

- Break on every Chrome update---



**ALRA:**### **Problem 4: Privacy Concerns**

- ✅ Runs 100% locally with Gemini Nano (seriously, zero servers)

- ✅ Minimal UI - one floating button, that's it🔒 **The Issue:**

- ✅ Actually uses Google's official Chrome AI APIs- Most AI tools send YOUR data to cloud servers for analysis

- ✅ Free and open source- You lose privacy for convenience

- ✅ Built specifically for modern Chrome (127+)- You never know what happens to your browsing data



It's not trying to replace your browser. It's just making your browser smarter.✨ **How ALRA Fixes It:**

- ALRA runs AI predictions **locally on your device** by default

## How I Built This- Your data never leaves your computer

- Optional encrypted cloud sync for cross-device features is minimal and transparent

### The Tech Stack- **Privacy-first, always**



**Frontend:**---

- TypeScript (because I like catching bugs before they happen)

- Vanilla JS for content scripts (React is overkill for this)## ✨ What Can ALRA Do For You?

- Chrome Extension Manifest V3 (the modern standard)

### **1. Predictive Tab / Next Action**

**AI Integration:**🔮 **The Magic:**

- **Gemini Nano** - Google's on-device language model- ALRA watches YOUR unique browsing patterns

- **Summarizer API** - For quick article summaries- It learns what you typically do next based on your history

- **Writer API** - For generating smart suggestions- A **glowing arrow appears**, highlighting the predicted next tab or task

- All running locally, no API keys, no subscriptions- Content is preloaded, so it's instant when you need it



**Sync & Storage:**> "It's like ALRA reads your mind — but it's just learning from your habits"

- Chrome Storage Sync API (built-in, works across devices)

- IndexedDB for local metrics---

- No external databases needed

### **2. Real-Time Page Optimization**

**Build Tools:**🎨 **The Magic:**

- Webpack 5 (bundling everything together)- Open a messy, ad-filled website

- PostCSS + Tailwind (for the popup UI)- ALRA instantly **cleans the entire page** in real-time

- TypeScript compiler (type safety ftw)- Removes ads, sidebars, and distracting elements

- Highlights key paragraphs and important information

### The Architecture- Reformats tables and images for maximum readability

- The transformation happens instantly — like magic

Here's how it all fits together:

> "Messy page → Beautiful, optimized page in seconds"

```

┌─────────────────────────────────────────┐---

│          CONTENT SCRIPT                  │

│  (Runs on every webpage you visit)      │### **3. Inline Summarization**

│                                          │📖 **The Magic:**

│  • Floating Action Button (FAB)         │- Reading a long article? ALRA **summarizes it instantly inline**

│  • AI Summary Modal                     │- Summarize emails without opening them

│  • Smart Nudges Panel                   │- Extract key points from PDFs without leaving the page

│  • Metrics Modal                        │- Get the essence in seconds instead of minutes

│  • Device Sync Manager                  │

└─────────────────────────────────────────┘> "Less scrolling. More understanding. More time for what matters."

           ↕️                    ↕️

┌─────────────────────┐   ┌──────────────────┐---

│  BACKGROUND SCRIPT  │   │   AI BRIDGE      │

│                     │   │                  │### **4. Action Nudges**

│  • Tab Management   │   │  • Gemini Nano   │💡 **The Magic:**

│  • Storage Sync     │   │  • Summarizer    │- ALRA generates **contextual next steps** for your workflow

│  • Metrics Tracking │   │  • Writer API    │- Subtle, intelligent suggestions appear at the right moment:

└─────────────────────┘   └──────────────────┘  - *"📊 This data connects to your previous research"*

           ↕️  - *"⏱️ You spent 5 minutes here; next step is ready"*

┌─────────────────────────────────────────┐  - *"🔗 Related article found"*

│         CHROME STORAGE                   │- Nudges guide you without interrupting

│  • Local: Preferences & Metrics          │

│  • Sync: Recommended Tabs & Sessions     │> "Proactive AI that helps you stay on track"

└─────────────────────────────────────────┘

```---



The cool part? The AI Bridge runs in the actual page context (not isolated like normal content scripts), which means it can access `window.ai` - that's where Gemini Nano lives.### **5. Cross-Device Predictive Sync** *(Optional)*

🌐 **The Magic:**

## Challenges I Faced (The Real Talk)- Start researching on your laptop

- Switch to your tablet or phone

### Challenge 1: Chrome's AI APIs Are... New- Your predicted next action **follows you**

Like, really new. Documentation? Sparse. Examples? Almost none. I spent hours just trying to figure out how to properly initialize Gemini Nano.- Preloaded content waits on your mobile device

- Seamless continuity across all your devices

**Solution:** Built an injected bridge script that runs in the page context. Content scripts can't access `window.ai` directly due to Chrome's security model, so I had to create a communication bridge using CustomEvents. Hacky? Maybe. Works? Absolutely.

> "Your browser remembers where you left off, no matter what device you use"

### Challenge 2: The Nudges Were Annoying

First version of the nudges would pop up automatically. I thought "helpful!" - users thought "PLEASE STOP". Fair point.---



**Solution:** Made everything user-controlled. Nothing appears unless you click the FAB button. Notifications are there when you want them, invisible when you don't.### **6. Privacy-First Operation**

🛡️ **The Magic:**

### Challenge 3: Mobile Chrome Doesn't Support Extensions- All AI inference happens **locally on your device**

Plot twist: Chrome on mobile doesn't allow extensions at all. My beautiful cross-device sync demo? Dead in the water.- No data sent to unknown servers

- No tracking, no profiling, no selling of habits

**Solution:** Instead of fighting it, I worked with Chrome's native features. ALRA syncs recommended tabs through Chrome Storage Sync, which makes them appear in Chrome's built-in "Recent Tabs" menu on all devices. No extension needed on mobile - it just works.- Optional encrypted sync for cross-device (transparent and minimal)

- You remain in complete control

### Challenge 4: Content Security Policy (CSP) Nightmares

Chrome's CSP rules for extensions are STRICT. Dynamic imports? Nope. Inline scripts? Forget it. Loading chunks? Only if you sacrifice a rubber duck to the Chrome gods.> "Smart AI. Your privacy. Your choice."



**Solution:** Bundled everything into single files. No dynamic imports, no chunk splitting, just good old-fashioned bundled JavaScript. Went from 5 failed builds to rock-solid reliability.---



### Challenge 5: Gemini Nano Model Downloads### **7. Productivity Metrics Dashboard**

The Gemini Nano model is ~1.7GB. Users need to download it manually through `chrome://components`. That's... not a great user experience.📊 **The Magic:**

- Visual overlay shows **real, quantifiable impact**:

**Solution:** Clear instructions in the setup guide. Also added capability detection - if Gemini Nano isn't available, ALRA falls back to smart heuristics. The experience gets better with AI, but it works without it too.  - 🎯 Tabs saved (predicted correctly)

  - ⏱️ Time saved (vs. manual scrolling and summarizing)

## What I Learned  - 🖱️ Clicks reduced (thanks to optimized pages)

  - ✅ Tasks completed faster

**1. Less is More**

My first version had like 8 different features competing for attention. Streamlined it to 5 core features accessible from one button. Way better.> "See exactly how much ALRA is improving your productivity"



**2. Privacy Isn't Just a Feature**---

People REALLY care about privacy. Making everything local and transparent wasn't just technically cool - it's what made people actually want to use it.

## 🎨 How ALRA Looks & Feels

**3. Chrome's AI APIs Are The Future**

Working with Gemini Nano was frustrating but eye-opening. On-device AI is legit powerful. No latency, no privacy concerns, no costs. This is where the web is heading.**Minimal User Interaction:** You don't need to click anything. ALRA works automatically and invisibly.



**4. Test on Real Content****Visual Cues:**

Building on `localhost` is easy. Making it work on every random website with weird CSS and aggressive JavaScript? That's the real challenge.- ✨ **Glowing highlights** around AI-suggested content

- 🔵 **Predictive arrows** pointing to your next tab or task

**5. Users Don't Read Docs**- 📦 **Inline nudge boxes** with color-coding:

Learned this the hard way. If a feature requires explanation, the UI is wrong. Made everything self-explanatory with tooltips and visual feedback.  - 🟢 **Green** = Suggested (recommended for you)

  - 🔵 **Blue** = Optional (if you're interested)

## How to Use It  - 🟠 **Orange** = High priority (time-sensitive or urgent)



### Quick Start**Everything is intuitive:** Even if you've never seen ALRA before, you instantly understand what it's doing.



1. **Get Chrome Canary** (version 127+)---

   - Regular Chrome doesn't have Gemini Nano yet

   - Download from google.com/chrome/canary## 🎯 ALRA in Action – The Full Experience



2. **Enable AI Features**1. **You open Chrome** with your usual browsing habits

   ```2. **Page loads** (messy, cluttered, hard to read)

   Open chrome://flags3. **ALRA activates instantly:**

      - Cleans the page ✨

   Enable these:   - Highlights key information 🎯

   - Prompt API for Gemini Nano   - Removes all clutter 🗑️

   - Summarization API for Gemini Nano  4. **Inline summary appears** (long article condensed)

   - Writer API for Gemini Nano5. **Actionable nudges pop up** (what to do next)

   - Optimization Guide On Device Model6. **Predictive tab is highlighted** (ALRA guesses your next action)

   7. **Optional: Cross-device sync** (your context follows you)

   Restart Chrome8. **Productivity dashboard shows impact** (time saved, clicks reduced)

   ```

**Total experience: Invisible, intelligent, and immediately useful**

3. **Download Gemini Nano**

   ```---

   Open chrome://components

   Find "Optimization Guide On Device Model"## 🚀 Why ALRA is Different

   Click "Check for update"

   Wait 10-15 minutes (it's ~1.7GB)| Aspect | Traditional Browsing | With ALRA |

   ```|--------|---------------------|-----------|

| **Page Clutter** | Ads, sidebars, distractions | Clean, focused, optimized |

4. **Install ALRA**| **Content Length** | Must scroll endlessly | Instant summaries |

   ```bash| **Device Switching** | Start over from scratch | Seamless continuity |

   # Clone this repo| **Next Action** | You decide (decision fatigue) | ALRA guides you (intelligent nudges) |

   git clone https://github.com/shiv669/Alra.git| **Privacy** | Data sent to servers | Everything stays on your device |

   cd Alra| **Productivity** | Unknown impact | Measured and tracked |

   

   # Install dependencies---

   npm install

   ## 💡 The ALRA Philosophy

   # Build the extension

   npm run buildWe believe that **AI should be:**

   

   # Load in Chrome✅ **Predictive, not reactive** — anticipate your needs, don't just react to them

   1. Open chrome://extensions

   2. Enable "Developer mode"✅ **Helpful, not intrusive** — work silently in the background

   3. Click "Load unpacked"

   4. Select the "dist" folder✅ **Transparent, not hidden** — you understand exactly what's happening

   ```

✅ **Local, not cloud-dependent** — your privacy matters more than convenience

5. **Start Using**

   - Visit any webpage✅ **Measurable, not mysterious** — see the real impact on your productivity

   - Look for the blue floating button (bottom-right)

   - Click it and explore!✅ **Proactive, not passive** — guide you toward your goals



### Features Walkthrough---



**📖 AI Summary:**## 🎓 Think of ALRA As...

- Click the FAB button → "✨ AI Summary"

- Wait 2-3 seconds while Gemini Nano analyzes the page🤖 **Your personal browsing co-pilot** → ALRA learns your habits and anticipates needs

- Get key points in a clean modal

- Close when done, or read the full article🧹 **A smart janitor** → Cleans up the mess on every website automatically



**💡 Smart Nudges:**📚 **A research assistant** → Summarizes everything so you don't have to

- Click FAB → "💡 Smart Nudges"

- See 4 contextual suggestions based on the page🗺️ **A navigation system** → Shows you the most logical next step

- Each shows an AI confidence score

- Click any suggestion to act on it🛡️ **A privacy guardian** → Keeps your data safe and local



**📊 Productivity Stats:**⏱️ **A productivity multiplier** → Tracks and amplifies your time savings

- Click FAB → "📊 Productivity Stats"

- See time saved, articles summarized, tabs predicted---

- All tracked locally, never sent anywhere

## ✨ The Bottom Line

**🔄 Device Sync:**

- Click FAB → "🔄 Device Sync" → Enable**ALRA transforms Chrome into an intelligent, privacy-first assistant that:**

- Browse normally, close tabs- Predicts what you need next

- On any device: Chrome menu → Recent Tabs- Cleans up the chaos you see

- See your recommended tabs (no extension needed!)- Summarizes the overwhelming

- Guides your workflow intelligently

## Project Structure- Protects your privacy completely

- Measures your productivity gain

```

Alra/**All of this happens automatically, invisibly, and right inside your browser.**

├── src/

│   ├── content/           # Main extension logic---

│   │   ├── content.ts     # Entry point

│   │   ├── floating-menu.ts## 🌟 Ready to Experience Smarter Browsing?

│   │   ├── summary-modal.ts

│   │   ├── smart-nudges-panel.ts> **"Predict. Clean. Guide. Make Chrome smarter."**

│   │   ├── metrics-modal.ts

│   │   ├── device-sync.ts**ALRA** – Your browser has never been this intelligent.

│   │   ├── summarizer.ts

│   │   ├── nudges.ts---

│   │   └── injected-ai-bridge.ts  # AI communication bridge

│   │---

│   ├── background/        # Service worker

│   │   └── background.ts  # Tab management, storage# 🔧 ALRA Implementation Plan - Hackathon Edition

│   │

│   ├── popup/             # Extension popup (React)## 📋 Project Overview

│   │   ├── popup.tsx

│   │   └── popup.htmlWe're building a Chrome extension that leverages **Google's on-device AI APIs** (Gemini Nano, Summarizer API, Writer API) to create an intelligent, privacy-first browsing assistant. Our goal is to deliver a **fully functional, demo-ready product** in 4-5 hackathon days that judges can see in action within 3 minutes.

│   │

│   └── manifest.json      # Extension config**Guiding Principle:** Every feature should be **visually impressive, immediately useful, and privacy-respecting**.

│

├── dist/                  # Built extension (git ignored)---

├── webpack.config.js      # Build configuration

└── package.json## 🛠️ Complete Tech Stack

```

### **Frontend & Core Extension**

## Performance

| Technology | Purpose | Why We Chose It |

Because I know you're wondering:|-----------|---------|-----------------|

| **Chrome Manifest v3** | Extension framework & permissions | Google standard, most secure, required for Chrome Store |

- **Bundle Size:** 89.4 KB (content script), 6.96 KB (background)| **TypeScript** | Type-safe scripting | Prevents bugs, improves maintainability during hackathon crunch |

- **Load Time:** < 500ms on most pages| **Tailwind CSS** | Styling nudges and UI elements | Lightweight, fast to prototype, perfect for extensions |

- **Memory Usage:** ~15-20 MB (comparable to a single Chrome tab)| **HTML/CSS/JavaScript** | Content script UI & DOM manipulation | Lightweight, zero dependencies needed |

- **CPU Impact:** Minimal (AI runs on-device, async processing)

### **AI & Machine Learning**

No bloat, no lag, just smooth browsing.

| Technology | Purpose | Why We Chose It |

## Browser Support|-----------|---------|-----------------|

| **Gemini Nano (Chrome AI)** | Predict next tab, user intent, workflow analysis | On-device, zero latency, privacy-first, officially approved |

- ✅ **Chrome Canary 127+** (Full AI features)| **Summarizer API (Chrome AI)** | Inline text summarization for articles/emails/PDFs | Lightweight, approved, no backend needed |

- ✅ **Chrome Dev 127+** (Full AI features)| **Writer/Rewriter API (Chrome AI)** | Generate actionable nudges and contextual suggestions | Official Chrome API, perfect for our use case |

- ⚠️ **Chrome Stable** (Waiting for AI APIs rollout)

- ❌ **Firefox/Safari/Edge** (Different AI APIs, not compatible)### **Data Storage & Sync**



This is specifically built for Chrome's AI ecosystem. Other browsers would need different implementations.| Technology | Purpose | Why We Chose It |

|-----------|---------|-----------------|

## Privacy & Security| **Chrome Storage API** | Local storage for browsing history & predictions | Built-in, reliable, no external database |

| **IndexedDB** (Optional) | For larger session caches | If we need more storage than localStorage |

Let me be crystal clear about this:| **Encrypted JSON** (Optional) | Cross-device sync payload | Minimal, transparent, user-controlled |



**What ALRA Collects:**### **Development Tools**

- Nothing. Seriously.

| Technology | Purpose | Why We Chose It |

**What Gets Sent to Servers:**|-----------|---------|-----------------|

- Nothing. Everything runs locally.| **Webpack / Vite** | Bundling & module loading | Fast builds, small bundle size |

| **ESLint + Prettier** | Code quality & consistency | Catches bugs early, faster code reviews |

**What Gets Synced:**| **Chrome DevTools** | Debugging extensions | Native, essential for extension development |

- Only recommended tabs through Chrome Storage Sync (encrypted by Google)

- Only if you enable Device Sync (off by default)---

- Uses Chrome's existing sync infrastructure

## 📦 Prerequisites & Environment Setup

**What AI Sees:**

- Only the text content of pages you're viewing### **Required Software**

- Processed locally by Gemini Nano on your device

- Never sent to external servers```

✅ Node.js 18+ (for build tools and package management)

**Permissions Explained:**✅ npm or yarn (package manager)

- `tabs` - To track which tab you're on✅ Google Chrome 127+ (with experimental APIs enabled)

- `storage` - To save your preferences locally✅ Git (for version control)

- `activeTab` - To read current page content✅ VS Code (recommended editor)

- `scripting` - To inject the floating menu✅ TypeScript knowledge (intermediate level)

- `<all_urls>` - To work on any website you visit```



I built this because I care about privacy. Your data stays on your device.### **Browser Flags to Enable (for testing)**



## Contributing```

chrome://flags/#enable-experimental-web-platform-features

Want to make ALRA better? I'd love that!→ Set to "Enabled" (for Chrome AI APIs)



### Areas That Need Helpchrome://flags/#optimization-guide-on-device-model

→ Set to "Enabled" (for Gemini Nano)

1. **Testing on Different Sites**```

   - Some websites have aggressive CSP that breaks the AI bridge

   - Need to build better fallback detection### **Chrome Extension Permissions We Need**



2. **Better Heuristics**```json

   - When Gemini Nano isn't available, ALRA uses rule-based suggestions{

   - These could be smarter  "permissions": [

    "tabs",                    // Read & monitor tabs

3. **UI Polish**    "storage",                 // Store browsing history

   - I'm a backend dev pretending to do UI    "activeTab",               // Get current tab info

   - If you have design chops, please help    "scripting",               // Inject content scripts

    "webRequest",              // Monitor web traffic (optional)

4. **Documentation**    "host_permissions": [

   - More examples, better onboarding      "<all_urls>"             // Access all websites

   - Video tutorials?    ]

  },

5. **Internationalization**  "optional_permissions": [

   - Currently English-only    "identity",                // For optional cloud sync

   - Would love multi-language support    "management"               // For browser data

  ]

### How to Contribute}

```

```bash

# Fork the repo---

# Clone your fork

git clone https://github.com/YOUR_USERNAME/Alra.git## 🎯 Implementation Approach - Phase by Phase



# Create a branch### **Phase 1: Foundation (Day 1)**

git checkout -b feature/your-cool-feature

#### **Goals:**

# Make changes- Set up extension project structure

# Test thoroughly (npm run build && load in Chrome)- Get Chrome AI APIs working locally

- Implement basic content script injection

# Commit- Test page DOM manipulation

git commit -m "Add your cool feature"

#### **Deliverables:**

# Push and create PR- ✅ Working Chrome extension that loads without errors

git push origin feature/your-cool-feature- ✅ Gemini Nano initialized and callable

```- ✅ Content script can read and modify page DOM

- ✅ Chrome Storage API working for basic data persistence

## Roadmap

#### **Tasks:**

What's next for ALRA?1. Initialize TypeScript + Webpack project structure

2. Create `manifest.json` with all required permissions

### Short Term (Next Month)3. Build `background.js` (service worker) with basic event listeners

- [ ] Better error handling for AI failures4. Build `content.js` (content script) that injects into every page

- [ ] Keyboard shortcuts (Alt+A to open FAB menu?)5. Set up Chrome Storage for session persistence

- [ ] Dark mode support6. Test on 3 sample websites (YouTube, Wikipedia, Medium)

- [ ] Export productivity stats as CSV

#### **Success Criteria:**

### Medium Term (Next 3 Months)```

- [ ] Firefox port (using different AI APIs)[ ] Extension loads in Chrome without manifest errors

- [ ] Custom nudge templates[ ] Extension icon appears in toolbar

- [ ] Smart bookmarking with tags[ ] Content script successfully runs on every page

- [ ] Reading list integration[ ] Console shows "ALRA initialized" message

[ ] Storage persists data across page reloads

### Long Term (Dreaming)```

- [ ] Multi-language support

- [ ] Voice commands (using Chrome's speech APIs)---

- [ ] Collaborative browsing (share sessions with team)

- [ ] Browser extension for other Chromium browsers### **Phase 2: Page Optimization (Day 1-2)**



## Known Issues#### **Goals:**

- Implement real-time page cleaning

Being honest here:- Remove ads and clutter

- Highlight key content

1. **Gemini Nano Download Required**- Create visual feedback system

   - Users need to manually download the model

   - Working on auto-detection and better prompts#### **Deliverables:**

- ✅ Ads automatically removed from any page

2. **Some Sites Block Injection**- ✅ Key headings/images highlighted with glowing effect

   - Very secure sites (banking, etc.) block content scripts- ✅ Readability score shown to user

   - Need to whitelist them or show graceful errors- ✅ Works on major websites (news, blogs, academic papers)



3. **Occasional Sync Delays**#### **Tasks:**

   - Chrome Storage Sync isn't instant1. Build DOM analyzer that identifies:

   - Can take 30-60 seconds to propagate   - Ad patterns (common ad selectors: `.ad`, `.advertisement`, `[data-ad]`)

   - Working on better loading states   - Sidebar/footer clutter

   - Main content area (largest text block)

4. **High Memory on Large Articles**2. Create CSS injection for glowing highlights:

   - Processing 10,000+ word articles can spike memory   ```css

   - Need to add chunking for large content   .alra-highlighted {

     box-shadow: 0 0 15px rgba(66, 153, 225, 0.6);

## FAQ     border-left: 4px solid #4299e1;

     padding-left: 10px;

**Q: Does this work on mobile Chrome?**   }

A: The extension itself doesn't (Chrome mobile doesn't support extensions), but the Device Sync feature works! Recommended tabs appear in Chrome's native "Recent Tabs" menu.   ```

3. Build "Page Quality Score" overlay showing:

**Q: Is this free?**   - % of clutter removed

A: Yes, completely free and open source.   - Readability improvement

   - Ads blocked count

**Q: Why do I need Chrome Canary?**4. Create toggle button for "ALRA Optimization On/Off"

A: Gemini Nano APIs are currently only in Chrome 127+, which is Canary/Dev channels. They'll roll out to stable Chrome eventually.

#### **Success Criteria:**

**Q: Can I use this without Gemini Nano?**```

A: Yes! ALRA falls back to smart heuristics if AI isn't available. You lose the AI summaries and smart suggestions, but core features still work.[ ] Ads removed from 95%+ of websites tested

[ ] Key content highlighted visually

**Q: Will this slow down my browser?**[ ] Glow effect visible and not distracting

A: Nope. Everything runs async, and the AI processing happens on-device without blocking your browsing.[ ] Toggle button works reliably

[ ] Page loading not slowed down

**Q: Can I customize the features?**[ ] No false positives (important content not removed)

A: Not yet, but it's on the roadmap! Want to contribute to this?```



## Acknowledgments---



- **Google Chrome Team** - For the amazing built-in AI APIs### **Phase 3: Summarization (Day 2)**

- **The Chrome Extension Discord** - Helped debug so many weird issues

- **My Coffee Machine** - For fueling the 3 AM coding sessions#### **Goals:**

- **Stack Overflow** - As always, the real MVP- Integrate Chrome Summarizer API

- Show inline summaries for articles/emails

## License- Create summary UI boxes

- Make summarization feel instant

MIT License - Use it, fork it, make it better!

#### **Deliverables:**

See [LICENSE](LICENSE) for full details.- ✅ Long articles auto-summarized inline

- ✅ Summary appears in elegant UI box

## Final Thoughts- ✅ Expandable/collapsible summary

- ✅ Works for different content types

I built ALRA because I was frustrated with how browsing the web had become. Too many tabs, too much clutter, too much noise.

#### **Tasks:**

The future of browsers isn't about adding more features - it's about making the existing experience smarter. Chrome's built-in AI is a glimpse of that future, and ALRA is my attempt to show what's possible.1. Detect article-like content:

   - Long paragraphs (300+ characters)

Is it perfect? Nope. Will it revolutionize browsing forever? Probably not. But does it make my daily browsing a little bit better? Yeah, it does.   - Multiple headings

   - Images with captions

And maybe it'll make yours better too.2. Use Chrome Summarizer API:

   ```typescript

---   const summary = await summarizer.summarize(text);

   // Returns { summary: "condensed text" }

**Built with ☕ and late nights for the Google Chrome Built-in AI Challenge 2025**   ```

3. Create Summary UI Component:

**Developer:** [Shivam](https://github.com/shiv669)     ```html

**Demo:** [Coming Soon - Recording in Progress]     <div class="alra-summary">

**Issues:** [Report Here](https://github.com/shiv669/Alra/issues)       <div class="summary-header">📖 AI Summary</div>

**Discussions:** [Let's Chat](https://github.com/shiv669/Alra/discussions)     <div class="summary-content">${summary}</div>

     <div class="summary-actions">

---       <button>Read Full</button>

       <button>Save</button>

*If this helped you, give it a ⭐ on GitHub. If it didn't, open an issue and let's fix it together!*     </div>

   </div>
   ```
4. Position summary intelligently:
   - After first heading
   - Or at top of article
   - Or in floating sidebar
5. Add fade-in animation for visual wow factor

#### **Success Criteria:**
```
[ ] Summaries appear within 2 seconds
[ ] Summary text is 60-70% shorter than original
[ ] UI doesn't cover important content
[ ] Works on news articles, blogs, Reddit posts
[ ] Summary button toggles visibility
[ ] No console errors
```

---

### **Phase 4: Predictive Features (Day 3)**

#### **Goals:**
- Implement tab prediction using Gemini Nano
- Show predictive arrows/highlights
- Log browsing patterns
- Create ML model for next-action prediction

#### **Deliverables:**
- ✅ Prediction engine analyzing browsing habits
- ✅ Next tab highlighted with glowing arrow
- ✅ Prediction accuracy measured
- ✅ Preloading of predicted tabs (optional)

#### **Tasks:**
1. Build Browsing Pattern Logger:
   ```typescript
   // Store every tab transition with timestamps
   interface TabEvent {
     tabId: number;
     url: string;
     title: string;
     timestamp: number;
     durationOnTab: number; // seconds
     sequence: number;
   }
   
   // Store last 100 tab transitions
   chrome.tabs.onActivated.addListener((activeInfo) => {
     logTabTransition(activeInfo.tabId);
   });
   ```

2. Build Prediction Engine with Gemini Nano:
   ```typescript
   async function predictNextTab(history: TabEvent[]): Promise<string> {
     const recentPattern = history.slice(-5).map(t => t.url).join(" → ");
     const prompt = `
       User's recent browsing: ${recentPattern}
       Based on this pattern, what website or tab type would they visit next?
       Return only the URL category or domain.
     `;
     
     const result = await geminiNano.generateContent(prompt);
     return result.response.text();
   }
   ```

3. Create Predictive UI:
   ```html
   <div class="alra-prediction">
     <div class="prediction-arrow">⬇️</div>
     <div class="prediction-text">Your next step: ${nextAction}</div>
     <div class="confidence-meter">
       Confidence: ${confidenceScore}%
     </div>
   </div>
   ```

4. Tab Highlighting:
   ```css
   .alra-predicted-tab {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
     animation: glow 2s ease-in-out infinite;
   }
   
   @keyframes glow {
     0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
     50% { box-shadow: 0 0 30px rgba(102, 126, 234, 1); }
   }
   ```

5. Optional: Preload predicted tabs in background

#### **Success Criteria:**
```
[ ] Prediction engine runs without lag
[ ] Next tab predicted with 60%+ accuracy
[ ] Glowing arrow visible on correct tabs
[ ] Confidence score displayed and accurate
[ ] Predictions update as user browses
[ ] Works for common workflows (research, shopping, email)
```

---

### **Phase 5: Action Nudges (Day 3-4)**

#### **Goals:**
- Generate contextual "next step" suggestions
- Use Writer API for nudge generation
- Create nudge UI that doesn't interrupt
- Make nudges feel intelligent and helpful

#### **Deliverables:**
- ✅ Contextual nudges generated in real-time
- ✅ Nudges appear at optimal times
- ✅ Color-coded by priority (green/blue/orange)
- ✅ User can dismiss or act on nudges

#### **Tasks:**
1. Build Nudge Trigger System:
   ```typescript
   // Trigger nudges when:
   interface NudgeTrigger {
     userSpentTime: number; // > 5 minutes on page
     pageType: string; // "article", "email", "product"
     previousActions: string[]; // Browsing history
     timeOfDay: string; // Morning, afternoon, evening
   }
   
   function shouldShowNudge(trigger: NudgeTrigger): boolean {
     // Smart heuristics to show nudges without annoying user
     if (trigger.userSpentTime > 300 && trigger.pageType === "article") {
       return true; // User reading for 5+ min, show nudge
     }
   }
   ```

2. Build Writer API Integration:
   ```typescript
   async function generateNudge(pageContent: string, userContext: string) {
     const prompt = `
       User is reading this content: "${pageContent.slice(0, 500)}"
       User's recent actions: ${userContext}
       
       Suggest ONE specific, actionable next step (max 10 words).
       Format: [emoji] [action]
       Examples: "🔗 Read related article", "💾 Save for later", "📧 Email this"
     `;
     
     const nudge = await writerAPI.generateText(prompt);
     return nudge;
   }
   ```

3. Create Nudge UI Components:
   ```html
   <!-- Green: Suggested -->
   <div class="alra-nudge nudge-suggested">
     <div class="nudge-icon">💡</div>
     <div class="nudge-text">Read next article</div>
     <button class="nudge-action">Go</button>
   </div>
   
   <!-- Blue: Optional -->
   <div class="alra-nudge nudge-optional">
     <div class="nudge-icon">📌</div>
     <div class="nudge-text">Save to reading list</div>
     <button class="nudge-action">Save</button>
   </div>
   
   <!-- Orange: High Priority -->
   <div class="alra-nudge nudge-priority">
     <div class="nudge-icon">⚡</div>
     <div class="nudge-text">Follow up on email</div>
     <button class="nudge-action">Act</button>
   </div>
   ```

4. Nudge Positioning Strategy:
   ```typescript
   // Show nudge in bottom-right corner
   // Or next to relevant content (floating)
   // Always dismissible with X button
   // Auto-hide after 10 seconds if not interacted
   ```

#### **Success Criteria:**
```
[ ] Nudges generated within 2 seconds
[ ] Nudges feel contextually relevant (not random)
[ ] Color coding is intuitive
[ ] Nudges don't cover critical content
[ ] Dismiss button always accessible
[ ] 70%+ of nudges acted upon by user
```

---

### **Phase 6: Metrics & Dashboard (Day 4)**

#### **Goals:**
- Track and display productivity metrics
- Show real impact to judges
- Create visual metrics overlay
- Prove ALRA's value quantitatively

#### **Deliverables:**
- ✅ Metrics dashboard showing:
  - Tabs saved (correct predictions)
  - Time saved (vs. manual scrolling)
  - Clicks reduced
  - Articles summarized
  - Tasks completed
- ✅ Data persists across sessions
- ✅ Visual charts/graphs

#### **Tasks:**
1. Build Metrics Tracking System:
   ```typescript
   interface Metrics {
     tabsPredictedCorrectly: number;
     timeSavedSeconds: number;
     clicksReduced: number;
     articlesSummarized: number;
     tasksCompleted: number;
     avgReadingTimeReduction: number; // %
   }
   
   // Track every action ALRA helps with
   chrome.storage.local.get("metrics", (result) => {
     const metrics = result.metrics || defaultMetrics;
     // Update metrics
     chrome.storage.local.set({ metrics });
   });
   ```

2. Create Metrics Calculation Logic:
   ```typescript
   function calculateTimeSaved(): number {
     // For each summarized article: estimate reading time - summary time
     // For each tab prediction: time saved searching vs. predicted ready
     // Return total seconds saved
   }
   
   function calculateClicksReduced(): number {
     // Ads removed = clicks saved
     // Optimized layout = scrolls reduced
     // Nudges reducing navigation = clicks saved
   }
   ```

3. Build Dashboard UI:
   ```html
   <div class="alra-dashboard">
     <h2>Your ALRA Impact Today</h2>
     
     <div class="metrics-grid">
       <div class="metric-card metric-time">
         <div class="metric-icon">⏱️</div>
         <div class="metric-value">${metrics.timeSaved} min</div>
         <div class="metric-label">Time Saved</div>
       </div>
       
       <div class="metric-card metric-tabs">
         <div class="metric-icon">🎯</div>
         <div class="metric-value">${metrics.tabsPredicted}</div>
         <div class="metric-label">Tabs Predicted</div>
       </div>
       
       <div class="metric-card metric-clicks">
         <div class="metric-icon">🖱️</div>
         <div class="metric-value">${metrics.clicksReduced}</div>
         <div class="metric-label">Clicks Reduced</div>
       </div>
       
       <div class="metric-card metric-articles">
         <div class="metric-icon">📖</div>
         <div class="metric-value">${metrics.articlesSummarized}</div>
         <div class="metric-label">Articles Summarized</div>
       </div>
     </div>
     
     <div class="metrics-chart">
       <!-- Simple bar/line chart showing daily impact -->
     </div>
   </div>
   ```

4. Dashboard Styling:
   ```css
   .metric-card {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     color: white;
     padding: 20px;
     border-radius: 10px;
     text-align: center;
     box-shadow: 0 8px 16px rgba(0,0,0,0.1);
   }
   
   .metric-value {
     font-size: 28px;
     font-weight: bold;
     margin: 10px 0;
   }
   ```

5. Create Popup Dashboard:
   ```typescript
   // When user clicks ALRA extension icon, show dashboard
   // Option to view detailed stats for the day/week/month
   ```

#### **Success Criteria:**
```
[ ] Metrics update in real-time
[ ] Data persists across sessions
[ ] Dashboard loads within 500ms
[ ] Metrics feel significant and impressive
[ ] Charts display correctly
[ ] UI is clean and professional
[ ] Judges immediately see productivity impact
```

---

### **Phase 7: Cross-Device Sync (Day 4-5, Optional)**

#### **Goals:**
- Implement lightweight encrypted sync
- Session continuity across devices
- Minimal data leaving device
- Transparent to user

#### **Deliverables:**
- ✅ Optional cloud sync that's transparent
- ✅ Session data encrypted
- ✅ Works on mobile Chrome
- ✅ Privacy policy clear

#### **Tasks:**
1. Build Sync Engine:
   ```typescript
   interface SyncSession {
     sessionId: string;
     predictedNextActions: string[];
     preloadedTabs: TabData[];
     timestamp: number;
     encryption: "AES-256";
   }
   
   async function syncToCloud(session: SyncSession) {
     // Minimal, encrypted payload
     // User must opt-in
     // Show what's being sent
   }
   ```

2. Mobile Detection:
   ```typescript
   function detectMobileChrome(): boolean {
     return /Android|iPhone|iPad/.test(navigator.userAgent);
   }
   ```

---

### **Phase 8: Polish & Demo Prep (Day 5)**

#### **Goals:**
- Test all features together
- Create demo script
- Prepare presentation
- Bug fixes and optimization

#### **Deliverables:**
- ✅ 3-minute demo video script
- ✅ 5 demo scenarios ready
- ✅ No console errors
- ✅ Performance optimized
- ✅ README updated with usage

#### **Tasks:**
1. Create Demo Scenarios:
   - **Scenario 1:** Open messy news article → ALRA cleans + summarizes (30s)
   - **Scenario 2:** Multiple tabs open → ALRA predicts next tab (20s)
   - **Scenario 3:** Show metrics dashboard with saved time (20s)
   - **Scenario 4:** Show privacy settings (15s)
   - **Scenario 5:** Show action nudges in action (20s)

2. Performance Optimization:
   - Minimize bundle size
   - Lazy load features
   - Cache AI results

3. Testing Checklist:
   ```
   [ ] Works on Chrome 127+
   [ ] No memory leaks
   [ ] No console errors
   [ ] Fast load time (<1s)
   [ ] All APIs respond correctly
   [ ] Works on 10+ major websites
   [ ] Mobile Chrome compatible
   ```

---

## 🎓 How Each Component Wins the Hackathon

### **Wow Factor Breakdown**

| Component | Wow Factor | Why Judges Love It |
|-----------|-----------|-------------------|
| **Page Optimization** | 🎨 Visual transformation in real-time | Immediate, tangible benefit visible to all |
| **Summarization** | 📖 Instant article reduction | Shows productivity gains immediately |
| **Prediction** | 🔮 "Reads your mind" feeling | Feels magical, shows ML in action |
| **Nudges** | 💡 Proactive AI assistance | Shifts from reactive to proactive |
| **Metrics** | 📊 Quantifiable impact | Judges see concrete numbers |
| **Privacy-First** | 🛡️ Ethical AI | Differentiates from competitors |
| **Cross-Device** | 🌐 Seamless continuity | Rarely seen, raises bar |

---

## 🏆 Hackathon Winning Strategy

### **Week-of Execution Timeline**

```
Day 1:
  Morning: Setup infrastructure & foundation
  Afternoon: Get first feature (page optimization) working
  Evening: Test on multiple websites

Day 2:
  Morning: Complete page optimization, start summarization
  Afternoon: Summarization working end-to-end
  Evening: Test UX, gather feedback

Day 3:
  Morning: Implement predictions with Gemini Nano
  Afternoon: Add nudges with Writer API
  Evening: Start metrics tracking

Day 4:
  Morning: Complete metrics dashboard
  Afternoon: Polish all features, optimize performance
  Evening: Create demo video & practice presentation

Day 5:
  Morning: Final bug fixes & optimizations
  Afternoon: Record demo video (2-3 takes)
  Evening: Final polish, submission
```

### **Judging Strategy**

**Judges will evaluate on:**

1. **Functionality** (Does it work?)
   - ✅ All core features functional
   - ✅ No crashes or major bugs
   - ✅ Smooth user experience

2. **Innovation** (Is it unique?)
   - ✅ Combines multiple Chrome AI APIs creatively
   - ✅ Predictive + Proactive (not just reactive)
   - ✅ Cross-device sync differentiates us

3. **Impact** (Does it matter?)
   - ✅ Visible productivity gains
   - ✅ Solves real problems users face
   - ✅ Metrics prove the value

4. **Technical Excellence** (Is it well-built?)
   - ✅ Clean, documented code
   - ✅ Follows best practices
   - ✅ Scalable architecture

5. **Presentation** (Can they explain it?)
   - ✅ Clear 3-minute demo
   - ✅ Compelling story
   - ✅ Judges understand the value

---

## 📊 Success Metrics for Hackathon

### **What We'll Measure**

```
✅ All 7 features implemented and working
✅ No console errors on major websites
✅ Page load time impact < 500ms
✅ Prediction accuracy > 60%
✅ 95% ad/clutter removal rate
✅ Summary generation < 2 seconds
✅ Nudges generated in real-time
✅ Metrics dashboard fully functional
✅ Demo video < 3 minutes
✅ Code documented and clean
```

---

## 🚀 Why ALRA Will Win

### **Unique Selling Points**

1. **Multiple AI APIs Combined** — First to use Gemini Nano + Summarizer + Writer together
2. **Predictive + Proactive** — Not reactive like other AI tools
3. **Privacy-First** — All inference local, optional cloud
4. **Measurable Impact** — Judges see quantifiable productivity gains
5. **Beautiful UX** — Glowing effects, smooth animations, intuitive
6. **Works Everywhere** — Content scripts run on any website
7. **Hackathon-Feasible** — All tech stack is available, approachable, no complex backend

---

## 📝 Technical Notes for Development

### **Key Implementation Details**

**Manifest v3 Best Practices:**
```json
{
  "manifest_version": 3,
  "name": "ALRA",
  "version": "1.0",
  "permissions": ["tabs", "storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}
```

**Chrome AI APIs Usage Pattern:**
```typescript
// Gemini Nano (on-device LLM)
async function gemini(prompt: string) {
  const canCreate = await ai.languageModel.canCreateTextSession();
  if (canCreate !== "readily") return null;
  
  const session = await ai.languageModel.createTextSession();
  return await session.prompt(prompt);
}

// Summarizer API
async function summarizeText(text: string) {
  if (!('summarizer' in ai)) return null;
  const summarizer = await ai.summarizer.create();
  return await summarizer.summarize(text);
}

// Writer API
async function rewriteText(text: string) {
  if (!('writer' in ai)) return null;
  const writer = await ai.writer.create();
  return await writer.rewrite(text);
}
```

**Content Script Injection Pattern:**
```typescript
// In content.js
window.addEventListener('DOMContentLoaded', () => {
  initializeALRA();
  optimizePageLayout();
  setupNudges();
  setupPredictions();
  trackMetrics();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  cleanupALRA();
});
```

---

*This implementation plan is designed to maximize judges' wow factor while staying realistic for 4-5 day hackathon execution. Every feature is ordered by visual impact and technical feasibility.*

*Made with 🧠 AI + 🛡️ Privacy + 🚀 Hackathon Spirit*
