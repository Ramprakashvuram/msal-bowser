import { INetworkModule, Logger } from "@azure/msal-common";
import { InteractionType } from "./BrowserConstants";
/**
 * Utility class for browser specific functions
 */
export declare class BrowserUtils {
    /**
     * Used to redirect the browser to the STS authorization endpoint
     * @param {string} urlNavigate - URL of the authorization endpoint
     * @param {boolean} noHistory - boolean flag, uses .replace() instead of .assign() if true
     */
    static navigateWindow(urlNavigate: string, navigationTimeout: number, logger: Logger, noHistory?: boolean): Promise<void>;
    /**
     * Clears hash from window url.
     */
    static clearHash(): void;
    /**
     * Replaces current hash with hash from provided url
     */
    static replaceHash(url: string): void;
    /**
     * Returns boolean of whether the current window is in an iframe or not.
     */
    static isInIframe(): boolean;
    /**
     * Returns current window URL as redirect uri
     */
    static getCurrentUri(): string;
    /**
     * Gets the homepage url for the current window location.
     */
    static getHomepage(): string;
    /**
     * Returns best compatible network client object.
     */
    static getBrowserNetworkClient(): INetworkModule;
    /**
     * Throws error if we have completed an auth and are
     * attempting another auth request inside an iframe.
     */
    static blockReloadInHiddenIframes(): void;
    /**
     * Block redirect operations in iframes unless explicitly allowed
     * @param interactionType Interaction type for the request
     * @param allowRedirectInIframe Config value to allow redirects when app is inside an iframe
     */
    static blockRedirectInIframe(interactionType: InteractionType, allowRedirectInIframe: boolean): void;
    /**
     * Throws error if token requests are made in non-browser environment
     * @param isBrowserEnvironment Flag indicating if environment is a browser.
     */
    static blockNonBrowserEnvironment(isBrowserEnvironment: boolean): void;
    /**
     * Returns boolean of whether current browser is an Internet Explorer or Edge browser.
     */
    static detectIEOrEdge(): boolean;
}
