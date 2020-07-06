import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface DepartmentDoc extends Document {
	departmentId: string;
	title: string;
	isDeleted: boolean;
}

const departmentSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		departmentId: {
			type: String,
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

export const departmentModel: Model<DepartmentDoc> = model<DepartmentDoc>(config.mongodb.collections.department,departmentSchema);
