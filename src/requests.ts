import { PossumRequest, StoredPossumRequest } from "./models"
import { getFailedRequests, removeFailedRequest, storeFailedRequest } from "./storage"

export async function performPossumRequest(request: PossumRequest): Promise<any> {
  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.data),
    })

    return response;
  } catch(error) {
    storeFailedRequest(request);
    throw error;
  }
}

export function processFailedRequestsOnLoad(): void {
  const failedRequests = getFailedRequests();
  failedRequests.forEach(request => {
    retryRequestInWorker(request);
  })
}

function retryRequestInWorker(request: StoredPossumRequest): void {
  const worker = new Worker('requestWorker.js');
  worker.postMessage(request);
  worker.onmessage = function(event) {
      if (event.data.success) {
          removeFailedRequest(request.id);
      }
  };
}

