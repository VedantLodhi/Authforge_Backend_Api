import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"; // 🔥 yahan

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

//  ROUTES FIRST (multer works)
app.use("/api/v1/users", userRouter);

// app.use(express.json({ limit: "20mb" }));
app.use(express.json());
// app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

export { app };