import { AuthorizationCodeRequest, AuthorizationCodeClient } from "@azure/msal-common";
import { InteractionHandler, InteractionParams } from "./InteractionHandler";
import { BrowserCacheManager } from "../cache/BrowserCacheManager";
export declare type PopupParams = InteractionParams & {
    popup?: Window | null;
};
/**
 * This class implements the interaction handler base class for browsers. It is written specifically for handling
 * popup window scenarios. It includes functions for monitoring the popup window for a hash.
 */
export declare class PopupHandler extends InteractionHandler {
    private currentWindow;
    constructor(authCodeModule: AuthorizationCodeClient, storageImpl: BrowserCacheManager);
    /**
     * Opens a popup window with given request Url.
     * @param requestUrl
     */
    initiateAuthRequest(requestUrl: string, authCodeRequest: AuthorizationCodeRequest, params: PopupParams): Window;
    /**
     * Monitors a window until it loads a url with a known hash, or hits a specified timeout.
     * @param popupWindow - window that is being monitored
     * @param timeout - milliseconds until timeout
     * @param urlNavigate - url that was navigated to
     */
    monitorPopupForHash(popupWindow: Window, timeout: number): Promise<string>;
    /**
     * @hidden
     *
     * Configures popup window for login.
     *
     * @param urlNavigate
     * @param title
     * @param popUpWidth
     * @param popUpHeight
     * @ignore
     * @hidden
     */
    private openPopup;
    static openSizedPopup(urlNavigate?: string): Window | null;
    /**
     * Event callback to unload main window.
     */
    unloadWindow(e: Event): void;
    /**
     * Closes popup, removes any state vars created during popup calls.
     * @param popupWindow
     */
    private cleanPopup;
}
