import { Response, NextFunction } from "express";
import httpCodes from "http-status-codes";
import { http_responder } from "../utils/http_response";
import Utils from "../utils/utils";
import redisClient from "../config/redis";



/**
  * cachedUserTickets
  * @desc A middleware to fetch cached user tickets
  * @param {Object} req request any
  * @param {Object} res response object
  * @param {Function} next nextFunction middleware
  * @returns {void|Object} object
  */
export const cachedUserTickets = (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user.id;
        const status = (req.query.status) ? req.query.status : "all";
        redisClient.get(`${user}:${status}`, async (err, tickets) => {
            if (err) throw err;
            if (tickets) {
                const { limit, page } = req.query;
                const dataArray = JSON.parse(tickets);
                const result = await Utils.paginator(dataArray, parseInt(limit), parseInt(page));
                
                return http_responder.successResponse(res, result, "tickets found", httpCodes.OK);
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return http_responder.errorResponse(res, errMessage, httpCodes.INTERNAL_SERVER_ERROR);
    }
};

/**
  * cachedTicket
  * @desc A middleware to authenticate admin users
  * @param {Object} req request any
  * @param {Object} res response object
  * @param {Function} next nextFunction middleware
  * @returns {void|Object} object
  */
export const cachedTicket = async (req: any, res: Response, next: NextFunction) => {
    try {
        const ticketId = req.params.id
        redisClient.get(`${ticketId}`, (err, data) => {
            if (err) throw err;
            if (data) {
                const ticket = JSON.parse(data);
                return http_responder.successResponse(res, { ticket }, "ticket found", httpCodes.OK);
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return http_responder.errorResponse(res, errMessage, httpCodes.INTERNAL_SERVER_ERROR);
    }
};

/**
  * cachedTickets
  * @desc A middleware to verify admin has the required role
  * @param {Object} req request any
  * @param {Object} res response object
  * @param {Function} next nextFunction middleware
  * @returns {void|Object} object
  */
export const cachedTickets = async (req: any, res: Response, next: NextFunction) => {
    try {
        const status = (req.query.status) ? req.query.status : "all";
        redisClient.get(`tickets:${status}`, async (err, tickets) => {
            if (err) throw err;
            if (tickets) {
                const { limit, page } = req.query;
                const dataArray = JSON.parse(tickets);
                const result = await Utils.paginator(dataArray, parseInt(limit), parseInt(page));

                return http_responder.successResponse(res, result, "tickets found", httpCodes.OK);
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return http_responder.errorResponse(res, errMessage, httpCodes.INTERNAL_SERVER_ERROR);
    }
};