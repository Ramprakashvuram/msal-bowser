/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __awaiter, __extends, __generator } from "tslib";
import { UrlString, StringUtils } from "@azure/msal-common";
import { InteractionHandler } from "./InteractionHandler";
import { BrowserConstants } from "../utils/BrowserConstants";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { DEFAULT_IFRAME_TIMEOUT_MS } from "../config/Configuration";
var SilentHandler = /** @class */ (function (_super) {
    __extends(SilentHandler, _super);
    function SilentHandler(authCodeModule, storageImpl, navigateFrameWait) {
        var _this = _super.call(this, authCodeModule, storageImpl) || this;
        _this.navigateFrameWait = navigateFrameWait;
        return _this;
    }
    /**
     * Creates a hidden iframe to given URL using user-requested scopes as an id.
     * @param urlNavigate
     * @param userRequestScopes
     */
    SilentHandler.prototype.initiateAuthRequest = function (requestUrl, authCodeRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (StringUtils.isEmpty(requestUrl)) {
                            // Throw error if request URL is empty.
                            this.authModule.logger.info("Navigate url is empty");
                            throw BrowserAuthError.createEmptyNavigationUriError();
                        }
                        // Save auth code request
                        this.authCodeRequest = authCodeRequest;
                        if (!this.navigateFrameWait) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadFrame(requestUrl)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.loadFrameSync(requestUrl);
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        });
    };
    /**
     * Monitors an iframe content window until it loads a url with a known hash, or hits a specified timeout.
     * @param iframe
     * @param timeout
     */
    SilentHandler.prototype.monitorIframeForHash = function (iframe, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (timeout < DEFAULT_IFRAME_TIMEOUT_MS) {
                _this.authModule.logger.warning("system.loadFrameTimeout or system.iframeHashTimeout set to lower (" + timeout + "ms) than the default (" + DEFAULT_IFRAME_TIMEOUT_MS + "ms). This may result in timeouts.");
            }
            /*
             * Polling for iframes can be purely timing based,
             * since we don't need to account for interaction.
             */
            var nowMark = window.performance.now();
            var timeoutMark = nowMark + timeout;
            var intervalId = setInterval(function () {
                if (window.performance.now() > timeoutMark) {
                    _this.removeHiddenIframe(iframe);
                    clearInterval(intervalId);
                    reject(BrowserAuthError.createMonitorIframeTimeoutError());
                    return;
                }
                var href;
                try {
                    /*
                     * Will throw if cross origin,
                     * which should be caught and ignored
                     * since we need the interval to keep running while on STS UI.
                     */
                    href = iframe.contentWindow.location.href;
                }
                catch (e) { }
                if (StringUtils.isEmpty(href)) {
                    return;
                }
                var contentHash = iframe.contentWindow.location.hash;
                if (UrlString.hashContainsKnownProperties(contentHash)) {
                    // Success case
                    _this.removeHiddenIframe(iframe);
                    clearInterval(intervalId);
                    resolve(contentHash);
                    return;
                }
            }, BrowserConstants.POLL_INTERVAL_MS);
        });
    };
    /**
     * @hidden
     * Loads iframe with authorization endpoint URL
     * @ignore
     */
    SilentHandler.prototype.loadFrame = function (urlNavigate) {
        /*
         * This trick overcomes iframe navigation in IE
         * IE does not load the page consistently in iframe
         */
        var _this = this;
        return new Promise(function (resolve, reject) {
            var frameHandle = _this.createHiddenIframe();
            setTimeout(function () {
                if (!frameHandle) {
                    reject("Unable to load iframe");
                    return;
                }
                frameHandle.src = urlNavigate;
                resolve(frameHandle);
            }, _this.navigateFrameWait);
        });
    };
    /**
     * @hidden
     * Loads the iframe synchronously when the navigateTimeFrame is set to `0`
     * @param urlNavigate
     * @param frameName
     * @param logger
     */
    SilentHandler.prototype.loadFrameSync = function (urlNavigate) {
        var frameHandle = this.createHiddenIframe();
        frameHandle.src = urlNavigate;
        return frameHandle;
    };
    /**
     * @hidden
     * Creates a new hidden iframe or gets an existing one for silent token renewal.
     * @ignore
     */
    SilentHandler.prototype.createHiddenIframe = function () {
        var authFrame = document.createElement("iframe");
        authFrame.style.visibility = "hidden";
        authFrame.style.position = "absolute";
        authFrame.style.width = authFrame.style.height = "0";
        authFrame.style.border = "0";
        authFrame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
        document.getElementsByTagName("body")[0].appendChild(authFrame);
        return authFrame;
    };
    /**
     * @hidden
     * Removes a hidden iframe from the page.
     * @ignore
     */
    SilentHandler.prototype.removeHiddenIframe = function (iframe) {
        if (document.body === iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    };
    return SilentHandler;
}(InteractionHandler));
export { SilentHandler };
//# sourceMappingURL=SilentHandler.js.map