import * as functions from "firebase-functions";
import axios from "axios";
import cors from "cors";

// Initialize cors middleware
const corsHandler = cors({origin: true});

exports.proxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Target URL is always set to the specific endpoint
    const targetUrl = "https://namestone.xyz/api/public_v1/claim-name";

    // Forward the request headers
    const forwardedHeaders = {...req.headers};
    delete forwardedHeaders["host"]; // Remove the host header

    // Access the secret API key
    const apiKey = functions.config().namestone.key;
    forwardedHeaders["Authorization"] = apiKey;

    try {
      // Forward the request to the target URL
      const response = await axios({
        method: "POST", // Always use POST for this specific endpoint
        url: targetUrl,
        headers: forwardedHeaders,
        data: req.body, // Forward the incoming request body
      });

      // Forward the response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Send the response back to the client
      res.status(response.status).send(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Forward error responses from the target
        res.status(error.response.status).send(error.response.data);
      } else {
        // Handle other errors
        res.status(500).send({message: "Internal Server Error"});
      }
    }
  });
});
