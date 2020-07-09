import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { http_responder } from './utils/http_response';
import BaseRouter from './routes';

// Init express
const app: Application = express();

// Connect database
connectDB();

app.disable("x-powered-by");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.use('/api/v1', BaseRouter);

app.get("/", (req, res) => {
	return http_responder.successResponse(
		res,
		{ githubUrl: "https://github.com/tajud99n/csts.git" },
		"welcome to CSTS Service"
	);
});


// handle errors
app.all("/*", (req: Request, res: Response) => {
    return http_responder.errorResponse(res, `${NOT_FOUND} - Not found`, NOT_FOUND);
});

app.use((err: any, req: Request, res: Response) => {
    logger.error(JSON.stringify(err.stack));
    return http_responder.errorResponse(res, err.message, err.status || INTERNAL_SERVER_ERROR);
});


export { app };
