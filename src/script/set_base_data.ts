import { uuid } from "uuidv4";
import { AdminModel } from "../models/admin";

async function start() {
	const existingAdmin = await AdminModel.findOne({
		email: "john@doe.com",
	});
	if (!existingAdmin) {
		const admin = new AdminModel();
		admin.name = "John Doe";
		admin.email = "John@doe.com";
        admin.adminId = uuid();
		admin.password = "password";
		await admin.save();
	}
}
start();
