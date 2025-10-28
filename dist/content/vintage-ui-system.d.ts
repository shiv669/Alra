/**
 * ALRA Vintage Postcard UI System
 *
 * Inspired by vintage postal aesthetics with:
 * - Rotating circular text
 * - Postcard-style cards
 * - Postal stamp badges
 * - Hand-drawn wavy cancellation marks
 * - Sepia/warm color palette
 */
export declare const VintageColors: {
    readonly primary: "#8B7355";
    readonly secondary: "#C4A57B";
    readonly accent: "#D4AF37";
    readonly background: "#FFF9F0";
    readonly cardBg: "#FFFEF9";
    readonly border: "#D4C5B0";
    readonly text: "#3E2723";
    readonly textMuted: "#6D4C41";
    readonly shadow: "rgba(62, 39, 35, 0.15)";
    readonly stampRed: "#C62828";
    readonly stampBlue: "#1565C0";
};
/**
 * Create rotating circular text SVG
 */
export declare function createCircularText(topText: string, bottomText: string, size?: number): SVGSVGElement;
/**
 * Create postal cancellation wavy lines
 */
export declare function createPostalCancellation(): SVGSVGElement;
/**
 * Create vintage postcard-style card wrapper
 */
export declare function createPostcardCard(content: HTMLElement): HTMLElement;
/**
 * Create postal stamp badge
 */
export declare function createPostalStamp(text: string, color?: 'red' | 'blue'): HTMLElement;
/**
 * Create vintage telegram-style message
 */
export declare function createTelegramMessage(message: string): HTMLElement;
/**
 * Create vintage button
 */
export declare function createVintageButton(text: string, onClick: () => void): HTMLElement;
/**
 * Inject global vintage styles and animations
 */
export declare function injectVintageStyles(): void;
