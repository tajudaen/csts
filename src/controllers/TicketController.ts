import { Response } from "express";
import { IRequestUser, ITicket, IRequestAdmin } from "../utils/types/custom";
import TicketService from '../services/TicketService';
import httpCodes, { NOT_FOUND } from "http-status-codes";
import { logger } from "../config/logger";
import { http_responder } from '../utils/http_response';
import { CreateTicketSchema, UpdateTicketCommentSchema } from "../utils/validations/ticket";
import Utils from "../utils/utils";
import { uuid } from 'uuidv4';
const { parse } = require('json2csv');
import redisClient from "../config/redis";

/**
  * newTicket
  * @desc A user should be able to create support ticket
  * Route: POST: '/api/v1/ticket'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function newTicket(req: IRequestUser, res: Response) {
	try {
		const errors = await Utils.validateRequest(req.body, CreateTicketSchema);
		if (errors) {
			return http_responder.errorResponse(res, errors, httpCodes.BAD_REQUEST);
		}

		const userId = req.user?._id;
		const { subject, content } = req.body;

		const ticketObject: ITicket = {
			subject,
			content,
			ticketId: uuid(),
			userId: userId
		};

		// save ticket
		const ticket = await TicketService.createTicket(ticketObject);
    	redisClient.del(`${userId}:all`);
    	redisClient.del(`${userId}:pending`);
    	redisClient.del("tickets:all");

		return http_responder.successResponse(res, { ticket }, "ticket created successfully", httpCodes.CREATED);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * getTicket
  * @desc A user get the details of a ticket with given id
  * Route: GET: '/api/v1/ticket/:id'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function getTicket(req: IRequestUser, res: Response) {
	try {
		const ticketId = req.params.id;
		const userId = req.user?._id;
		
		const ticket: any = await TicketService.findTicket(userId, ticketId);

		if (!ticket) {
			return http_responder.errorResponse(res, "ticket not found", httpCodes.NOT_FOUND);
		}

        redisClient.setex(`${ticket.ticketId}`, 3600, JSON.stringify(ticket));

		return http_responder.successResponse(res, { ticket }, "ticket found", httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * findTicket
  * @desc A user get the details of a ticket with given id
  * Route: GET: '/api/v1/admin/ticket/:id'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function findTicket(req: IRequestUser, res: Response) {
	try {
		const ticketId = req.params.id;
		const userId = req.user?._id;
		
		const ticket: any = await TicketService.findTicketAdmin(ticketId);

		if (!ticket) {
			return http_responder.errorResponse(res, "ticket not found", httpCodes.NOT_FOUND);
		}

        redisClient.setex(`${ticket.ticketId}`, 3600, JSON.stringify(ticket));

		return http_responder.successResponse(res, { ticket }, "ticket found", httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * getUserTickets
  * @desc A user should get all the tickets created by the user
  * Route: GET: '/api/v1/tickets/history'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function getUserTickets(req: any, res: Response) {
	try {
		const userId = req.user?._id;
		const defaultStartDate = new Date("1970-01-01").toISOString();
		const defaultEndDate = new Date().toISOString();
		const { limit, page } = req.query;
		const query = {
			startDate: req.query.startDate ? new Date(req.query.startDate).toISOString() : defaultStartDate,
			endDate: req.query.endDate ? new Date(req.query.endDate).toISOString() : defaultEndDate,
			status: req.query.status ? [req.query.status] : ["pending", "open", "closed"]
		}
		
		const tickets: any = await TicketService.getUserTickets(userId, query);

		if (!tickets.length) {
			return http_responder.errorResponse(res, "no tickets found", httpCodes.NOT_FOUND);
		}
		const status = req.query.status ? req.query.status : "all";
		
		redisClient.setex(`${userId}:${status}`, 3600, JSON.stringify(tickets));
		const result = await Utils.paginator(tickets, limit, page);
        

		return http_responder.successResponse(res, result, "tickets found", httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * userCommentOnTicket
  * @desc A user should be able to comment a ticket created by the user
  * Route: PUT: '/api/v1/tickets/:id'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function userCommentOnTicket(req: IRequestUser, res: Response) {
	try {
		const userId = req.user?._id;
		const ticketId = req.params.id;
		const { comment } = req.body;

		const errors = await Utils.validateRequest(req.body, UpdateTicketCommentSchema);
		if (errors) {
			return http_responder.errorResponse(res, errors, httpCodes.BAD_REQUEST);
		}

		const ticket = await TicketService.findTicketById(ticketId);
		if (!ticket) {
			const errMessage = "ticket does not exist";
			return http_responder.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
		}

		if (!ticket.isOpenForComment) {
			const errMessage = "comment not allowed";
			return http_responder.errorResponse(res, errMessage, httpCodes.FORBIDDEN);
		}

		const comments = [...ticket.meta.comments];
		comments.push({
			comment,
			commenter: userId,
			onModel: "user"
		});
		const meta = ticket.meta;
		meta.comments = comments;

		const updatedTicket = await TicketService.updateTicket(ticket._id, { meta });
		redisClient.del(`${ticketId}`);
		redisClient.del(`${userId}:all`);
		redisClient.del(`${userId}:open`);
		redisClient.del(`${userId}:closed`);
		redisClient.del("tickets:all");

		const message = "Ticket updated successfully";
		return http_responder.successResponse(res, { ticket: updatedTicket }, message, httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * updateTicket
  * @desc An admin should be able to update(comment or status) a ticket created by the user
  * Route: PUT: '/api/v1/tickets/:id'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function updateTicket(req: IRequestAdmin, res: Response) {
	try {
		const userId = req.user?._id;
		const ticketId = req.params.id;
		const { comment, status } = req.body;

		const errors = await Utils.validateRequest(req.body, UpdateTicketCommentSchema);
		if (errors) {
			return http_responder.errorResponse(res, errors, httpCodes.BAD_REQUEST);
		}

		const ticket = await TicketService.findTicketById(ticketId);
		if (!ticket) {
			const errMessage = "ticket does not exist";
			return http_responder.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
		}

		const updateObject: any = {}

		if (comment) {
			const comments = [...ticket.meta.comments];
			comments.push({
				comment,
				commenter: userId,
				onModel: "admin"
			});
			const meta = ticket.meta;
			meta.comments = comments;
			updateObject.meta = meta;
			if (!ticket.isOpenForComment) {
				updateObject.isOpenForComment = true;
			}
		}

		if (status) {
			updateObject.status = status;
		}

		if (status == "closed") {
			updateObject.treatedById = userId;
			updateObject.treatedDate = new Date;
		}

		const updatedTicket = await TicketService.updateTicket(ticket._id, updateObject);

		redisClient.del(`${ticketId}`);
		redisClient.del(`${ticket.userId}:all`);
		redisClient.del(`${ticket.userId}:open`);
		redisClient.del(`${ticket.userId}:closed`);
		redisClient.del("tickets:all");

		const message = "Ticket updated successfully";
		return http_responder.successResponse(res, { ticket: updatedTicket }, message, httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * getAllTickets
  * @desc An admin should get all the tickets created by users
  * Route: GET: '/api/v1/tickets/history'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function getAllTickets(req: any, res: Response) {
	try {
		const defaultStartDate = new Date("1970-01-01").toISOString();
		const defaultEndDate = new Date().toISOString();
		const { limit, page } = req.query;
		const query = {
			startDate: req.query.startDate ? new Date(req.query.startDate).toISOString() : defaultStartDate,
			endDate: req.query.endDate ? new Date(req.query.endDate).toISOString() : defaultEndDate,
			status: req.query.status ? [req.query.status] : ["pending", "open", "closed"]
		}

		const tickets: any = await TicketService.getAllTickets(query);

		if (!tickets.length) {
			return http_responder.errorResponse(res, "no tickets found", httpCodes.NOT_FOUND);
		}
        const status = req.query.status ? req.query.status : "all";
		redisClient.setex(`tickets:${status}`, 3600, JSON.stringify(tickets));

		const result = await Utils.paginator(tickets, limit, page);

		return http_responder.successResponse(res, result, "tickets found", httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

/**
  * getTicketsReport
  * @desc An admin should be able to download a CSV file containing report of all closed ticket in the last one month
  * Route: GET: '/api/v1/tickets/report'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function getTicketsReport(req: any, res: Response) {
	try {

		const tickets: any = await TicketService.getClosedTickets();
		if (!tickets.length) {
			return http_responder.errorResponse(res, "no reports", NOT_FOUND);
		}
		let finalArray = [];
		for (let ticket of tickets) {
			const body = {
				id: ticket.ticketId,
				customer: ticket.userId.name,
				email: ticket.userId.email,
				subject: ticket.subject,
				content: ticket.content,
				requestDate: ticket.createdAt,
				agent: ticket.treatedById.name,
				closedDate: ticket.treatedDate
			};
			finalArray.push(body);
		}
		const result = finalArray;
		
		const data = JSON.parse(JSON.stringify(result));
		
		const csvFields = [
			"id",
			"customer",
			"email",
			"subject",
			"content",
			"requestDate",
			"agent",
			"closedDate",
		];
		const opts = { csvFields };
		const csvData = parse(data, opts);

		//send as csv
		return http_responder.downloadResponse(res, csvData, "report.csv");
		
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}