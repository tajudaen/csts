import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface AdminDoc extends Document {
	name: string;
	email: string;
}

const adminSchema = new Schema({
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
	password: {
		type: String,
		require: true,
		minlength: 6,
		trim: true,
	},
});

export const adminModel: Model<AdminDoc> = model<AdminDoc>(config.mongodb.collections.admin,adminSchema);
