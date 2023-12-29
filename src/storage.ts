import {PossumRequest, StoredPossumRequest} from "./models";

let STORAGE_KEY = "failedRequests";

const inBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"

const inMemoryStore: Record<string, any> = {}

let PossumStore = {
    get(id: string): any {
        if (!inBrowser) {
            return inMemoryStore[id]
        }

        const data = localStorage.getItem(id)

        return data ? JSON.parse(data) : null
    },
    set(id: string, data: any): void {
        if (!inBrowser) {
            inMemoryStore[id] = {...data}
            return
        }

        localStorage.setItem(id, JSON.stringify({...data}));
    }
}

export interface PossumStoreConfigOptions {
    /** Name of key to associate with failed requests */
    keyName?: string;
    /**
     * Allows how store retrieves data to be defined
     * @param id - identifier for failed
     */

    get: (id: string) => any
    /** Allows data is stored to be defined */
    set: (id: string, data: any) => void
}

export function configurePossumStore(options: PossumStoreConfigOptions) {
    const {get, set, keyName} = options

    PossumStore = {get, set}

    if (keyName != null) {
        STORAGE_KEY = keyName
    }
}

/**
 * Stores a failed request in local storage.
 * @param request - The PossumRequest object containing the failed request details.
 */
export function storeFailedRequest(request: PossumRequest) {
    // Generate a unique ID for the request based on the current timestamp.
    const id = Date.now().toString();

    // Create a StoredPossumRequest object, adding the unique ID to the request.
    const storedRequest: StoredPossumRequest = {...request, id};

    // Retrieve any existing failed requests from local storage.
    const failedRequests = getFailedRequests();

    // Add the new failed request to the array of existing requests.
    failedRequests.push(storedRequest);

    // Update Possum store with the new list of failed requests
    PossumStore.set(STORAGE_KEY, failedRequests)
}

/**
 * Removes a failed request from local storage by its ID.
 * @param id - The unique ID of the failed request to be removed.
 */
export function removeFailedRequest(id: string): void {
    // Retrieve the current list of failed requests from local storage.
    const failedRequests = getFailedRequests();

    // Filter out the request with the given ID.
    const updatedRequests = failedRequests.filter((req) => req.id !== id);

    // Update possum store with the new list of failed requests.
    PossumStore.set(STORAGE_KEY, JSON.stringify(updatedRequests))
}

/**
 * Retrieves the list of failed requests stored in local storage.
 * @returns An array of StoredPossumRequest objects.
 */
export function getFailedRequests(): StoredPossumRequest[] {
    // Retrieve the stored failed requests from possum store.
    return PossumStore.get(STORAGE_KEY)
}



