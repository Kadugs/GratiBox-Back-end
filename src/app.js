import express from "express";
import cors from "cors";

import { signUp, signIn } from "./controllers/clients.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/sign-up", signUp);

app.post('/sign-in', signIn);

export default app;
