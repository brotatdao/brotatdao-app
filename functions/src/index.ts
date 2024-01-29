import * as functions from "firebase-functions";
import * as corsAnywhere from "cors-anywhere";

// Access the secret API key
const apiKey = functions.config().namestone.api_key;

// Create a new instance of cors-anywhere
const corsProxy = corsAnywhere.createServer({
  originWhitelist: [
    "https://brotatdaobeta.on-fleek.app",
    "https://brotatdao.com",
    "https://brotatdao.xyz",
    "https://brotatdao.eth.limo",
    "https://brotatdao.eth",
    "https://beta.brotatdao.com",
    "https://beta.brotatdao.xyz",
    "https://beta.brotatdao.eth.limo",
    "https://beta.brotatdao.eth",
  ], // Blank to allow all origins
  requireHeader: ["origin", "x-requested-with"],
  removeHeaders: ["cookie", "cookie2"],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
  },
});

exports.proxy = functions.https.onRequest((req, res) => {
  console.log("Received request:", req.method, req.url);
  console.log("Request headers:", req.headers);

  if (req.method === "OPTIONS") {
    // Handle the pre-flight request
    req.headers["Authorization"] = apiKey;
    console.log("Handling pre-flight request");
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,POST");
    res.set("Access-Control-Allow-Headers", "origin, x-requested-with, content-type");
    res.status(204).send("");
  } else {
    // Modify the URL to direct to the target API endpoint
    req.url = req.url.replace("/proxy/claim-name", "https://namestone.xyz/api/public_v1/claim-name");
    console.log("Modified URL for proxy:", req.url);

    // Handle the actual request
    corsProxy.emit("request", req, res);
  }
});
