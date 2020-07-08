import { Response } from "express";
import { IRequestAdmin, IAdmin } from "../utils/types/custom";
import AdminService from '../services/AdminService';
import httpCodes from "http-status-codes";
import { logger } from "../config/logger";
import { http_responder } from '../utils/http_response';
import { CreateAdminSchema } from "../utils/validations/admin";
import Utils from "../utils/utils";
import { uuid } from 'uuidv4';

 /**
   * newAdmin
   * @desc As an admin with the role admin you should be able create other admin user with unique email
   * Route: POST: '/api/v1/admin/invite'
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {void|Object} object
   */
export async function newAdmin(req: IRequestAdmin, res: Response) {
	try {
		// validate request payload
		const errors = await Utils.validateRequest(req.body, CreateAdminSchema);
		if (errors) {
			return http_responder.errorResponse(res, errors, httpCodes.BAD_REQUEST);
		}
		
		const { name, email, role, password } = req.body;
		const checkEmail = await AdminService.getAdminByEmail(email.toLowerCase());
		if (checkEmail) {
			const errMessage = "Email already exists";
			return http_responder.errorResponse(res, errMessage, httpCodes.BAD_REQUEST);
		}

		const adminObject: IAdmin = {
			name: name.toLowerCase(),
			email: email.toLowerCase(),
			role: role.toLowerCase(),
			adminId: uuid(),
			password: password
		};

		// save admin
		const user = await AdminService.createAdmin(adminObject);

		return http_responder.successResponse(res, { user }, "user created successfully", httpCodes.CREATED);
	} catch (error) {
		logger.error(JSON.stringify(error));
		return http_responder.errorResponse(
			res,
			error.message,
			httpCodes.INTERNAL_SERVER_ERROR
		);
	}
}
