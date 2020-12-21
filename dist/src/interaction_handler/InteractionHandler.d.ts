import { AuthorizationCodeRequest, AuthenticationResult, AuthorizationCodeClient, Authority, INetworkModule } from "@azure/msal-common";
import { BrowserCacheManager } from "../cache/BrowserCacheManager";
export declare type InteractionParams = {};
/**
 * Abstract class which defines operations for a browser interaction handling class.
 */
export declare abstract class InteractionHandler {
    protected authModule: AuthorizationCodeClient;
    protected browserStorage: BrowserCacheManager;
    protected authCodeRequest: AuthorizationCodeRequest;
    constructor(authCodeModule: AuthorizationCodeClient, storageImpl: BrowserCacheManager);
    /**
     * Function to enable user interaction.
     * @param requestUrl
     */
    abstract initiateAuthRequest(requestUrl: string, authCodeRequest: AuthorizationCodeRequest, params: InteractionParams): Window | Promise<HTMLIFrameElement> | Promise<void>;
    /**
     * Function to handle response parameters from hash.
     * @param locationHash
     */
    returnCode(locationHash: string, authority: Authority, networkModule: INetworkModule): Promise<string>;
    handleCodeResponse(locationHash: string, authority: Authority, networkModule: INetworkModule): Promise<AuthenticationResult>;
    protected updateTokenEndpointAuthority(cloudInstanceHostname: string, authority: Authority, networkModule: INetworkModule): Promise<void>;
}
