import {performPossumRequest, processFailedRequestsOnLoad} from "./requests";
import {configurePossumStore, PossumStoreConfigOptions} from "./storage";
import {inBrowser} from "./in-browser";

if (inBrowser()) {
    /**
     * Adds an event listener to the document that triggers when the DOM is fully loaded.
     * This ensures that the script runs only after the entire page is loaded.
     */
    document.addEventListener("DOMContentLoaded", (_event) => {
        // Calls the function to process any failed requests that might have been stored.
        // This is particularly useful for retrying requests that failed in a previous session.
        try {
            processFailedRequestsOnLoad();
        } catch (e) {
        }
    })

}

export interface PossumClientOptions {
    store?: PossumStoreConfigOptions
}

export function PossumClient(options?: PossumClientOptions) {
    if (options?.store != null) {
        configurePossumStore(options.store)
    }
    return {performPossumRequest, processFailedRequestsOnLoad}
}
