import { Request } from "express";
export interface IRequestAdmin extends Request {
	user?: {
		_id: string;
		role?: string;
	};
}

export interface IRequestUser extends Request {
	user?: {
		id: string;
	};
}

export interface ITicket {
	ticketId: string;
	subject: string;
	request: string;
	categoryId: string;
	userId: string;
}

export interface IAdmin {
	adminId: string;
	name: string;
	email: string;
	password: string;
	role?: string;
}

export interface ICategory {
	categoryId: string;
	title: string;
}
