import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import utils from "../utils/utils";
import { uuid } from "uuidv4";


export interface UserDoc extends Document {
	_id: string;
	name: string;
	email: string;
	password: string;
	isDeleted: boolean;
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
		password: {
			type: String,
			require: true,
			minlength: 6,
			trim: true,
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

userSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	delete obj._id;
	return obj;
};

userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		const hashed = await utils.hashPassword(user.get("password"));
		user.set("password", hashed);
	}
	next();
});


userSchema.methods.generateAuthToken = function () {
	const tokenData = {
		id: this._id,
	};
	const token = jwt.sign(tokenData, config.jwt.SECRETKEY, {
		subject: config.appName,
		algorithm: config.jwt.alg,
		expiresIn: config.jwt.expires,
		issuer: config.jwt.issuer,
	});
	return token;
};


export const UserModel: Model<UserDoc> = model<UserDoc>(config.mongodb.collections.user, userSchema);

async function start() {
	const existingUser = await UserModel.findOne({
		email: "jane@doe.com",
	});
	if (!existingUser) {
		const user = new UserModel();
		user.name = "Jane Doe";
		user.email = "jane@doe.com";
		user.password = "password";
		await user.save();
	}
}
start();