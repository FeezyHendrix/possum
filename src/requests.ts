import axios, {AxiosResponse} from "axios";
import {PossumRequest, StoredPossumRequest} from "./models";
import {getFailedRequests, removeFailedRequest, storeFailedRequest} from "./storage";
import workerPool from "./workerPool";

/**
 * Performs an HTTP request using the Fetch API.
 * @param request - The PossumRequest object containing all necessary data for the request.
 * @returns A Promise that resolves to the response of the HTTP request.
 */
export async function performPossumRequest(request: PossumRequest): Promise<AxiosResponse> {
    try {
        // Execute the HTTP request using axios.
        return await axios({
            method: request.method,
            url: request.url,
            headers: request.headers,
            data: request.data,
        });
    } catch (error) {
        // If an error occurs, store the failed request for later retry and rethrow the error.
       await storeFailedRequest(request)

        throw error;
    }
}

/**
 * Processes failed requests stored in local storage.
 * This function is typically called on page load.
 *
 * @param callbackFn - function to execute after `processFailedRequestsOnLoad` is done executing
 */
export function processFailedRequestsOnLoad(callbackFn?: () => void): void   {
    // Retrieve the list of failed requests from local storage.
    const failedRequests = getFailedRequests();

    if (failedRequests instanceof Promise) {
        failedRequests.then(failedReqs => {
            failedReqs.forEach(request => {
                retryRequestInWorker(request)
            })

            callbackFn?.()
        })

        return
    }

    // Iterate over each failed request and attempt to retry it using a web worker.
    failedRequests.forEach((request) => {
        retryRequestInWorker(request);
    });

    callbackFn?.()

}

/**
 * Retries a failed request using a Web Worker.
 * @param request - The StoredPossumRequest object representing the failed request.
 */
function retryRequestInWorker(request: StoredPossumRequest): void {
    // Using the worker pool:
    workerPool.run(request, (err: any, event: MessageEvent) => {
        if (err || !event.data.success) {
            // If an error occurs, store the failed request for later retry and rethrow the error.
            storeFailedRequest(request)
            return;
        }
        console.log(event.data);
        // If the request is successfully processed, remove it from the list of failed requests.
        removeFailedRequest(request.id)
    });
}
