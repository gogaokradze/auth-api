import express from "express";
import cors from "cors";
import mongoose, { ConnectOptions } from "mongoose";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
dotenv.config();

import corsOptions from "./config/corsOptions";
import authRoutes from "./modules/auth/auth.routes";
import { isAuthenticated } from "./services/isAuthenticated";

import cookieParser from "cookie-parser";

const app = express();

// import { logout } from "./modules/auth/auth.controllers";

// Enable CORS
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json());

app.use(isAuthenticated);

// Use the routes
app.use("/auth", authRoutes);
// app.use("/logout", logout);

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then((res) => {
    console.log("Connected to Distribution API Database - Initial Connection");
  })
  .catch((err) => {
    console.log(`Initial Distribution API Database connection error occured -`, err);
  });
