import { Response } from "express";
import { OK , INTERNAL_SERVER_ERROR } from "http-status-codes";

const http_responder = {
  async errorResponse(res: Response, message: string = '', statusCode: number = INTERNAL_SERVER_ERROR) {
    return res.status(statusCode).send({
			error: true,
			code: statusCode,
			message,
		});
  },

  async successResponse(res: Response, data: any = {}, message: string = '', statusCode: number = OK) {
    return res.status(statusCode).send({
			error: false,
			code: statusCode,
			message,
			data,
		});
	},
  
	async downloadResponse(res: Response, data: any, filename: string = 'demo.csv', statusCode: number = OK) {
	  	res.setHeader("Content-disposition", `attachment; filename=${filename}`);
		res.set("Content-Type", "text/csv");
    	return res.status(statusCode).end(data);
  	},
}

export { http_responder };