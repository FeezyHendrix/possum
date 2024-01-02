import {PossumRequest, StoredPossumRequest} from "./models";
import {inBrowser} from "./in-browser";

let STORAGE_KEY = "failedRequests";

const inMemoryStore: Record<string, any> = {}

let PossumStore: Pick<PossumStoreConfigOptions, 'get' | 'set'> = {
    get(id): StoredPossumRequest[] {
        if (!inBrowser()) {
            return inMemoryStore[id]
        }

        const data = localStorage.getItem(id)

        return data ? JSON.parse(data) : null
    },
    set(id, data): void {
        if (!inBrowser()) {
            inMemoryStore[id] = data
            return
        }

        localStorage.setItem(id, JSON.stringify(data));
    }
}

export interface PossumStoreConfigOptions {
    /** Name of key to associate with failed requests (Default: `"failedRequests"`) */
    keyName?: string;
    /**
     * Defines how data is retrieved
     *
     * @param id - identifier for the stored failed requests
     *
     * @example
     *
     * import { createClient } from 'redis';
     *
     * const redisClient = await createClient()
     *   .on('error', err => console.log('Redis Client Error', err))
     *   .connect();
     *
     *   //..
     *   get: async (id: string): Promise<StoredPossumRequest[]> => {
     *    const data = await redisClient.get(id);
     *    return data ? JSON.parse(data) : null;
     *   }
     *
     *
     *
     */

    get: (id: string) => StoredPossumRequest[] | Promise<StoredPossumRequest[]>
    /**
     * Defines how data is stored
     *
     * @param id - identifier for the stored failed requests
     * @param data - the list containing the failed requests
     *
     * @example
     *
     * import { createClient } from 'redis';
     *
     * const redisClient = await createClient()
     *   .on('error', err => console.log('Redis Client Error', err))
     *   .connect();
     *
     * //..
     *
     * set: async (id: string, data: StoredPossumRequest[]): Promise<void> => {
     *  await redisClient.set(id, JSON.stringify(data))
     * }
     *
     */
    set: (id: string, data: StoredPossumRequest[]) => void | Promise<void>
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
export function storeFailedRequest(request: PossumRequest): void | Promise<void> {
    // Generate a unique ID for the request based on the current timestamp.
    const id = Date.now().toString();

    // Create a StoredPossumRequest object, adding the unique ID to the request.
    const storedRequest: StoredPossumRequest = {...request, id};

    // Retrieve any existing failed requests from local storage.
    const failedRequests = getFailedRequests();

    // if the store is asynchronous in nature then it returns a promise
    if (failedRequests instanceof Promise) {
        return failedRequests.then((failedReqs) => {

            failedReqs.push(storedRequest)

            return PossumStore.set(STORAGE_KEY, failedReqs)
        })

    }

    // Add the new failed request to the array of existing requests.
    failedRequests.push(storedRequest);

    // Update Possum store with the new list of failed requests
    PossumStore.set(STORAGE_KEY, failedRequests)
}

/**
 * Removes a failed request from local storage by its ID.
 * @param id - The unique ID of the failed request to be removed.
 */
export function removeFailedRequest(id: string): void | Promise<void> {
    // Retrieve the current list of failed requests from local storage.
    let failedRequests = getFailedRequests();

    if (failedRequests instanceof Promise) {
        return failedRequests.then((failedReqs) => {
            // Filter out the request with the given ID.
            const updatedRequests = failedReqs.filter((req) => req.id !== id)
            // Update possum store with the new list of failed requests.
            return PossumStore.set(STORAGE_KEY, updatedRequests)
        })
    }

    // Filter out the request with the given ID.
    const updatedRequests = failedRequests.filter((req) => req.id !== id);

    // Update possum store with the new list of failed requests.
    PossumStore.set(STORAGE_KEY, updatedRequests)
}

/**
 * Retrieves the list of failed requests stored in local storage.
 * @returns An array of StoredPossumRequest objects or a promise of it.
 */
export function getFailedRequests(): StoredPossumRequest[] | Promise<StoredPossumRequest[]> {
    // Retrieve the stored failed requests from possum store.
    return PossumStore.get(STORAGE_KEY)
}



