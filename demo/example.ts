import { performPossumRequest } from "possum";

const callApi = async () => {
  try {
    const response = await performPossumRequest({
      url: "localhost:4000/good-vibes",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
  } catch (error) {
    // request reconciles and throws
    console.log(error);
  }
};


callApi();