import express, { Application } from "express";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// app.all("*", async (req, res) => {
// 	throw new NotFoundError();
// });

// app.use(errorHandler);

export { app };
