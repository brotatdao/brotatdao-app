import express, {Request, Response} from "express";
import * as functions from "firebase-functions";
// import cors from "cors";
import axios from "axios";


const app = express();

// const allowedOrigins = [
//  "https://brotatdaobeta.on-fleek.app",
//  "https://brotatdao.com",
//  "https://brotatdao.xyz",
//  "https://brotatdao.eth.limo",
//  "https://brotatdao.eth",
//  "https://beta.brotatdao.com",
//  "https://beta.brotatdao.xyz",
//  "https://beta.brotatdao.eth.limo",
//  "https://beta.brotatdao.eth",
// add more URLs as needed
// ];

// app.use(cors({origin: allowedOrigins}));

app.post("/claim-name", async (req: Request, res: Response) => {
  const apiEndpoint = "https://namestone.xyz/api/public_v1/claim-name";

  // Use headers from incoming request
  const headers = {...req.headers};

  try {
    const response = await axios.post(apiEndpoint, req.body, {headers});
    res.send(response.data);
  } catch (error) {
    res.status(500).send((error as Error).toString());
  }
});

exports.proxy = functions.https.onRequest(app);
