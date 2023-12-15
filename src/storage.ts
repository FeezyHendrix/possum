import { PossumRequest, StoredPossumRequest } from "./models";
const STORAGE_KEY = 'failedRequests';

export function storeFailedRequest(request: PossumRequest) {
  const id = Date.now().toString();
  const storedRequest: StoredPossumRequest = { ...request, id };
  const failedRequests = getFailedRequests();
  failedRequests.push(storedRequest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(failedRequests));
}

export function removeFailedRequest(id: string): void {
  const failedRequests = getFailedRequests();
  const updatedRequests = failedRequests.filter(req => req.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
}


export function getFailedRequests(): StoredPossumRequest[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

