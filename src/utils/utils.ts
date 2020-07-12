/**
 * Utils object.
 * contains various helper function
 */
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Joi from "@hapi/joi";

const Utils = {
	async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(config.salt);
		const hash = await bcrypt.hash(password, salt);
		return hash;
	},

	async validatePassword(password: string, passwordHash: string): Promise<boolean> {
		const isMatch = await bcrypt.compare(password, passwordHash);
		if (!isMatch) {
			return false;
		}
		return true;
	},

	verifyToken(token: string): any {
		try {
			const decoded = jwt.verify(token, config.jwt.SECRETKEY, {
				subject: config.appName,
				algorithms: [config.jwt.alg],
				issuer: config.jwt.issuer,
			});
			return decoded;
		} catch (error) {
			throw new Error("Invalid Token");
		}
	},

	async validateRequest(requestBody: any, validationSchema: Joi.Schema) {
		const errors = validationSchema.validate(requestBody);

		if (errors.error) {
			return errors.error.details[0].message;
		}
	},

	async paginator(dataArray: any = {}, limit: number = 10, page: number = 1) {
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		const data: any = {};

		if (endIndex < dataArray.length) {
			data.next = {
				page: page + 1,
				limit: limit,
			};
		}

		if (startIndex > 0) {
			data.previous = {
				page: page - 1,
				limit: limit,
			};
		}
		data.result = dataArray.slice(startIndex, endIndex);
		data.count = dataArray.length;

    	return data;
	}
};

export default Utils;
