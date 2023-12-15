import { PossumRequest, StoredPossumRequest } from "./models";

const STORAGE_KEY = "failedRequests";

/**
 * Stores a failed request in local storage.
 * @param request - The PossumRequest object containing the failed request details.
 */
export function storeFailedRequest(request: PossumRequest) {
  // Generate a unique ID for the request based on the current timestamp.
  const id = Date.now().toString();

  // Create a StoredPossumRequest object, adding the unique ID to the request.
  const storedRequest: StoredPossumRequest = { ...request, id };

  // Retrieve any existing failed requests from local storage.
  const failedRequests = getFailedRequests();

  // Add the new failed request to the array of existing requests.
  failedRequests.push(storedRequest);

  // Update the local storage with the new list of failed requests.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(failedRequests));
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

  // Update local storage with the new list of failed requests.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
}

/**
 * Retrieves the list of failed requests stored in local storage.
 * @returns An array of StoredPossumRequest objects.
 */
export function getFailedRequests(): StoredPossumRequest[] {
  // Retrieve the stored failed requests from local storage.
  const stored = localStorage.getItem(STORAGE_KEY);

  // Parse and return the stored requests, or return an empty array if none are found.
  return stored ? JSON.parse(stored) : [];
}
