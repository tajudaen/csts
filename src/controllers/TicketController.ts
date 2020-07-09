import { Response } from "express";
import { IRequestUser, ITicket } from "../utils/types/custom";
import TicketService from '../services/TicketService';
import httpCodes from "http-status-codes";
import { logger } from "../config/logger";
import { http_responder } from '../utils/http_response';
import { CreateTicketSchema, UpdateTicketCommentSchema } from "../utils/validations/ticket";
import Utils from "../utils/utils";
import { uuid } from 'uuidv4';

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
  * getAllTickets
  * @desc A user should get all the tickets created by the user
  * Route: GET: '/api/v1/tickets/history'
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {void|Object} object
  */
export async function getAllTickets(req: any, res: Response) {
	try {
		const userId = req.user?._id;
		const defaultStartDate = new Date("1970-01-01").toISOString();
		const defaultEndDate = new Date().toISOString();
		const query = {
			startDate: req.query.startDate ? new Date(req.query.startDate).toISOString() : defaultStartDate,
			endDate: req.query.endDate ? new Date(req.query.endDate).toISOString() : defaultEndDate,
			status: req.query.status ? [req.query.status] : ["pending", "open", "closed"]
		}
		
		const tickets: any = await TicketService.getAllTickets(userId, query);

		if (!tickets.length) {
			return http_responder.errorResponse(res, "no tickets found", httpCodes.NOT_FOUND);
		}
		return http_responder.successResponse(res, { tickets }, "tickets found", httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}

export async function updateTicket(req: IRequestUser, res: Response) {
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
		})

		const team = await TicketService.updateTicketcomment(ticketId, comments);

		const message = "Ticket updated successfully";
		return http_responder.successResponse(res, { team }, message, httpCodes.OK);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}