/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { DEFAULT_REQUEST, ApiId, InteractionType } from "../utils/BrowserConstants";
import { ClientApplication } from "./ClientApplication";
import { EventType } from "../event/EventType";
/**
 * The PublicClientApplication class is the object exposed by the library to perform authentication and authorization functions in Single Page Applications
 * to obtain JWT tokens as described in the OAuth 2.0 Authorization Code Flow with PKCE specification.
 */
var PublicClientApplication = /** @class */ (function (_super) {
    __extends(PublicClientApplication, _super);
    /**
     * @constructor
     * Constructor for the PublicClientApplication used to instantiate the PublicClientApplication object
     *
     * Important attributes in the Configuration object for auth are:
     * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
     * - authority: the authority URL for your application.
     * - redirect_uri: the uri of your application registered in the portal.
     *
     * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
     * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
     * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
     * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
     * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
     * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
     *
     * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
     * Full B2C functionality will be available in this library in future versions.
     *
     * @param {@link (Configuration:type)} configuration object for the MSAL PublicClientApplication instance
     */
    function PublicClientApplication(configuration) {
        return _super.call(this, configuration) || this;
    }
    /**
     * Use when initiating the login process by redirecting the user's browser to the authorization endpoint. This function redirects the page, so
     * any code that follows this function will not execute.
     *
     * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
     * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
     *
     * @param {@link (RedirectRequest:type)}
     */
    PublicClientApplication.prototype.loginRedirect = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.acquireTokenRedirect(request || DEFAULT_REQUEST)];
            });
        });
    };
    /**
     * Use when initiating the login process via opening a popup window in the user's browser
     *
     * @param {@link (PopupRequest:type)}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    PublicClientApplication.prototype.loginPopup = function (request) {
        return this.acquireTokenPopup(request || DEFAULT_REQUEST);
    };
    /**
     * Silently acquire an access token for a given set of scopes. Will use cached token if available, otherwise will attempt to acquire a new token from the network via refresh token.
     *
     * @param {@link (SilentRequest:type)}
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    PublicClientApplication.prototype.acquireTokenSilent = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var silentRequest, serverTelemetryManager, silentAuthClient, cachedToken, e_1, tokenRenewalResult, tokenRenewalError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.preflightBrowserEnvironmentCheck(InteractionType.Silent);
                        silentRequest = __assign(__assign(__assign({}, request), this.initializeBaseRequest(request)), { forceRefresh: request.forceRefresh || false });
                        this.emitEvent(EventType.ACQUIRE_TOKEN_START, InteractionType.Silent, request);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 9]);
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent_silentFlow, silentRequest.correlationId);
                        return [4 /*yield*/, this.createSilentFlowClient(serverTelemetryManager, silentRequest.authority)];
                    case 2:
                        silentAuthClient = _a.sent();
                        return [4 /*yield*/, silentAuthClient.acquireCachedToken(silentRequest)];
                    case 3:
                        cachedToken = _a.sent();
                        this.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Silent, cachedToken);
                        return [2 /*return*/, cachedToken];
                    case 4:
                        e_1 = _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.acquireTokenByRefreshToken(silentRequest)];
                    case 6:
                        tokenRenewalResult = _a.sent();
                        this.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Silent, tokenRenewalResult);
                        return [2 /*return*/, tokenRenewalResult];
                    case 7:
                        tokenRenewalError_1 = _a.sent();
                        this.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Silent, null, tokenRenewalError_1);
                        throw tokenRenewalError_1;
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return PublicClientApplication;
}(ClientApplication));
export { PublicClientApplication };
//# sourceMappingURL=PublicClientApplication.js.map