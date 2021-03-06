import { CryptoOps } from "../crypto/CryptoOps";
import { Authority, AuthorizationCodeRequest, AuthorizationUrlRequest, AuthorizationCodeClient, AccountInfo, ServerTelemetryManager, SilentFlowClient, ClientConfiguration, BaseAuthRequest, INetworkModule, AuthenticationResult, Logger, RefreshTokenClient, SilentFlowRequest, EndSessionRequest as CommonEndSessionRequest } from "@azure/msal-common";
import { BrowserCacheManager } from "../cache/BrowserCacheManager";
import { Configuration } from "../config/Configuration";
import { InteractionType } from "../utils/BrowserConstants";
import { RedirectRequest } from "../request/RedirectRequest";
import { PopupRequest } from "../request/PopupRequest";
import { SsoSilentRequest } from "../request/SsoSilentRequest";
import { EventError, EventPayload, EventCallbackFunction } from "../event/EventMessage";
import { EventType } from "../event/EventType";
import { EndSessionRequest } from "../request/EndSessionRequest";
export declare abstract class ClientApplication {
    protected readonly browserCrypto: CryptoOps;
    protected readonly browserStorage: BrowserCacheManager;
    protected readonly networkClient: INetworkModule;
    protected readonly tokenExchangePromise: Promise<AuthenticationResult>;
    protected config: Configuration;
    protected defaultAuthority: Authority;
    protected logger: Logger;
    protected isBrowserEnvironment: boolean;
    private eventCallbacks;
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
    constructor(configuration: Configuration);
    /**
     * Event handler function which allows users to fire events after the PublicClientApplication object
     * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
     * auth flows.
     * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
     * @returns {Promise.<AuthenticationResult | null>} token response or null. If the return value is null, then no auth redirect was detected.
     */
    handleRedirectPromise(hash?: string): Promise<AuthenticationResult | null>;
    /**
     * Checks if navigateToLoginRequestUrl is set, and:
     * - if true, performs logic to cache and navigate
     * - if false, handles hash string and parses response
     */
    private handleRedirectResponse;
    /**
     * Gets the response hash for a redirect request
     * Returns null if interactionType in the state value is not "redirect" or the hash does not contain known properties
     * @returns {string}
     */
    private getRedirectResponseHash;
    /**
     * Checks if hash exists and handles in window.
     * @param responseHash
     * @param interactionHandler
     */
    private handleHash;
    /**
     * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
     * the page, so any code that follows this function will not execute.
     *
     * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
     * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
     *
     * @param {@link (RedirectRequest:type)}
     */
    acquireTokenRedirect(request: RedirectRequest): Promise<void>;
    /**
     * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
     * @param {@link (PopupRequest:type)}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    acquireTokenPopup(request: PopupRequest): Promise<AuthenticationResult | string>;
    /**
     * Helper which obtains an access_token for your API via opening a popup window in the user's browser
     * @param {@link (PopupRequest:type)}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    private acquireCodePopupAsync;
    private acquireTokenPopupAsync;
    /**
     * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
     * - Any browser using a form of Intelligent Tracking Prevention
     * - If there is not an established session with the service
     *
     * In these cases, the request must be done inside a popup or full frame redirect.
     *
     * For the cases where interaction is required, you cannot send a request with prompt=none.
     *
     * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
     * you session on the server still exists.
     * @param {@link AuthorizationUrlRequest}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    ssoSilent(request: SsoSilentRequest): Promise<AuthenticationResult>;
    /**
     * This function uses a hidden iframe to fetch an authorization code from the eSTS. To be used for silent refresh token acquisition and renewal.
     * @param {@link AuthorizationUrlRequest}
     * @param request
     */
    private acquireTokenByIframe;
    /**
     * Use this function to obtain a token before every call to the API / resource provider
     *
     * MSAL return's a cached token when available
     * Or it send's a request to the STS to obtain a new token using a refresh token.
     *
     * @param {@link (SilentRequest:type)}
     *
     * To renew idToken, please pass clientId as the only scope in the Authentication Parameters
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     *
     */
    protected acquireTokenByRefreshToken(request: SilentFlowRequest): Promise<AuthenticationResult>;
    /**
     * Helper which acquires an authorization code silently using a hidden iframe from given url
     * using the scopes requested as part of the id, and exchanges the code for a set of OAuth tokens.
     * @param navigateUrl
     * @param userRequestScopes
     */
    private silentTokenHelper;
    /**
     * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
     * Default behaviour is to redirect the user to `window.location.href`.
     * @param {@link (EndSessionRequest:type)}
     */
    logout(logoutRequest?: EndSessionRequest): Promise<void>;
    /**
     * Returns all accounts that MSAL currently has data for.
     * (the account object is created at the time of successful login)
     * or empty array when no accounts are found
     * @returns {@link AccountInfo[]} - Array of account objects in cache
     */
    getAllAccounts(): AccountInfo[];
    /**
     * Returns the signed in account matching username.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found.
     * This API is provided for convenience but getAccountById should be used for best reliability
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    getAccountByUsername(userName: string): AccountInfo | null;
    /**
     * Returns the signed in account matching homeAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    getAccountByHomeId(homeAccountId: string): AccountInfo | null;
    /**
     * Returns the signed in account matching localAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    getAccountByLocalId(localAccountId: string): AccountInfo | null;
    /**
     *
     * Use to get the redirect uri configured in MSAL or null.
     * @returns {string} redirect URL
     *
     */
    protected getRedirectUri(requestRedirectUri?: string): string;
    /**
     * Use to get the post logout redirect uri configured in MSAL or null.
     *
     * @returns {string} post logout redirect URL
     */
    protected getPostLogoutRedirectUri(requestPostLogoutRedirectUri?: string): string;
    /**
     * Used to get a discovered version of the default authority.
     */
    getDiscoveredDefaultAuthority(): Promise<Authority>;
    /**
     * Helper to check whether interaction is in progress.
     */
    protected interactionInProgress(): boolean;
    /**
     * Creates an Authorization Code Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    protected createAuthCodeClient(serverTelemetryManager: ServerTelemetryManager, authorityUrl?: string): Promise<AuthorizationCodeClient>;
    /**
     * Creates an Silent Flow Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    protected createSilentFlowClient(serverTelemetryManager: ServerTelemetryManager, authorityUrl?: string): Promise<SilentFlowClient>;
    /**
     * Creates a Refresh Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    protected createRefreshTokenClient(serverTelemetryManager: ServerTelemetryManager, authorityUrl?: string): Promise<RefreshTokenClient>;
    /**
     * Creates a Client Configuration object with the given request authority, or the default authority.
     * @param requestAuthority
     */
    protected getClientConfiguration(serverTelemetryManager: ServerTelemetryManager, requestAuthority?: string): Promise<ClientConfiguration>;
    /**
     * Helper to validate app environment before making a request.
     */
    protected preflightInteractiveRequest(request: RedirectRequest | PopupRequest, interactionType: InteractionType): AuthorizationUrlRequest;
    /**
     * Helper to validate app environment before making an auth request
     * * @param request
     */
    protected preflightBrowserEnvironmentCheck(interactionType: InteractionType): void;
    /**
     * Initializer function for all request APIs
     * @param request
     */
    protected initializeBaseRequest(request: Partial<BaseAuthRequest>): BaseAuthRequest;
    protected initializeServerTelemetryManager(apiId: number, correlationId: string, forceRefresh?: boolean): ServerTelemetryManager;
    /**
     * Helper to initialize required request parameters for interactive APIs and ssoSilent()
     * @param request
     */
    protected initializeAuthorizationRequest(request: RedirectRequest | PopupRequest | SsoSilentRequest, interactionType: InteractionType): AuthorizationUrlRequest;
    /**
     * Generates an auth code request tied to the url request.
     * @param request
     */
    protected initializeAuthorizationCodeRequest(request: AuthorizationUrlRequest): Promise<AuthorizationCodeRequest>;
    /**
     * Initializer for the logout request.
     * @param logoutRequest
     */
    protected initializeLogoutRequest(logoutRequest?: EndSessionRequest): CommonEndSessionRequest;
    /**
     * Emits events by calling callback with event message
     * @param eventType
     * @param interactionType
     * @param payload
     * @param error
     */
    protected emitEvent(eventType: EventType, interactionType?: InteractionType, payload?: EventPayload, error?: EventError): void;
    /**
     * Adds event callbacks to array
     * @param callback
     */
    addEventCallback(callback: EventCallbackFunction): string | null;
    removeEventCallback(callbackId: string): void;
    /**
     * Returns the logger instance
     */
    getLogger(): Logger;
    /**
     * Replaces the default logger set in configurations with new Logger with new configurations
     * @param logger Logger instance
     */
    setLogger(logger: Logger): void;
}
