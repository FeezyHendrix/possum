import { performPossumRequest, processFailedRequestsOnLoad } from "./requests";

document.addEventListener("DOMContentLoaded", (event) => {
  processFailedRequestsOnLoad();
})


export { performPossumRequest };