import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface AgentDoc extends Document {
	name: string;
	email: string;
	agentId: string;
    department: string;
    isDeleted: string;
}

const supportSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 5,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			minlength: 5,
			trim: true,
			unique: true,
		},
		agentId: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			require: true,
			minlength: 6,
			trim: true,
		},
		departmentId: {
			type: Schema.Types.ObjectId,
			ref: "departments",
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

export const agentModel: Model<AgentDoc> = model<AgentDoc>(config.mongodb.collections.support,supportSchema);
