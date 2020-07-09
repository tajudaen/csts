import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface TicketDoc extends Document {
	ticketId: string;
	subject: string;
	content: string;
	userId: any;
	status: string;
	isOpenForComment: boolean;
	meta: any;
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
		content: {
			type: String,
			required: true,
			minlength: 1,
		},
		ticketId: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: "pending",
			enum: ["pending", "open", "closed"],
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
		},
		isOpenForComment: {
			type: Boolean,
			default: false,
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

ticketSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj._id;
	return obj;
};

export const TicketModel: Model<TicketDoc> = model<TicketDoc>(config.mongodb.collections.ticket,ticketSchema);
