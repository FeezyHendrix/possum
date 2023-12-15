onmessage = async function (event) {
  const request = event.data;

  try {
    // Perform the HTTP request using fetch or any other HTTP library
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" ? JSON.stringify(request.data) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Post a success message back to the main thread
    postMessage({ success: true, data: data, id: request.id });
  } catch (error) {
    // If an error occurs, post back the error details
    postMessage({ success: false, error: error.message, id: request.id });
  }
};
