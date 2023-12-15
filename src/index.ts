import { performPossumRequest, processFailedRequestsOnLoad } from "./requests";

/**
 * Adds an event listener to the document that triggers when the DOM is fully loaded.
 * This ensures that the script runs only after the entire page is loaded.
 */
document.addEventListener("DOMContentLoaded", (event) => {
  // Calls the function to process any failed requests that might have been stored.
  // This is particularly useful for retrying requests that failed in a previous session.
  try {
    processFailedRequestsOnLoad();
  } catch(e) {}
})

// Export the performPossumRequest function for use in other parts of the application.
export { performPossumRequest, processFailedRequestsOnLoad };
