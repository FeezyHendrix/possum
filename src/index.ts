import {performPossumRequest, processFailedRequestsOnLoad} from "./requests";
import {configurePossumStore, PossumStoreConfigOptions} from "./storage";
import {inBrowser} from "./in-browser";


export interface PossumClientOptions {
    /**
     * Options to define the storage possum would use to store failed requests.
     */
    store?: PossumStoreConfigOptions;
    /**
     * If true possum would attach an event listener to process stored failed requests on `DOMContentLoaded`.
     * This option only works while on the browser (default: `true`)
     */
    retryOnPageLoad?: boolean;
}

export function PossumClient(options: PossumClientOptions = {retryOnPageLoad: true}) {
    if (options.store != null) {
        configurePossumStore(options.store)
    }

    if (options.retryOnPageLoad && inBrowser()) {
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

    return {performPossumRequest, processFailedRequestsOnLoad}
}

