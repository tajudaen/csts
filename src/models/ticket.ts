import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface TicketDoc extends Document {
	ticketId: string;
	subject: string;
	request: string;
	categoryId: string;
	userId: string;
	agentId?: string;
	status: string;
	meta?: object;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ticketSchema = new Schema(
	{
		subject: {
			type: String,
			required: true,
			minlength: 1,
		},
		request: {
			type: String,
			required: true,
			minlength: 1,
		},
		ticketId: {
			type: String,
			required: true,
			unique: true,
		},
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: "departments",
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		agentId: {
			type: Schema.Types.ObjectId,
			ref: "supportagents",
		},
		status: {
			type: String,
			required: true,
			default: "pending",
			enum: ["pending", "open", "solved"],
		},
		meta: {
			comments: [
				{
					comment: {
						type: String,
					},
					commenter: {
						type: Schema.Types.ObjectId,
					},
					createdAt: {
						type: Date,
						default: Date.now,
					},
				},
			],
			isFollowUp: {
				type: Boolean,
				default: false,
			},
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const ticketModel: Model<TicketDoc> = model<TicketDoc>(config.mongodb.collections.ticket,ticketSchema);
