import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface UserDoc extends Document {
	userId: string;
	name: string;
	email: string;
}

const userSchema = new Schema(
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
		userId: {
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
	},
	{
		timestamps: true,
	}
);

export const userModel: Model<UserDoc> = model<UserDoc>(config.mongodb.collections.user, userSchema);