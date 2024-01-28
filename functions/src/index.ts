import express, {Request, Response} from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import axios from "axios";


const app = express();
const apiKey = functions.config().namestone.key;

app.use(cors({origin: true}));

app.post("/claim-name", async (req: Request, res: Response) => {
  const apiEndpoint = "https://namestone.xyz/api/public_v1/claim-name";
  const headers = {
    "Authorization": apiKey,
  };

  try {
    const response = await axios.post(apiEndpoint, req.body, {headers});
    res.send(response.data);
  } catch (error) {
    res.status(500).send((error as Error).toString());
  }
});

exports.proxy = functions.https.onRequest(app);
