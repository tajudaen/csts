import { AdminModel } from "../models/admin";
import { IAdmin } from "../utils/types/custom";

const AdminService = {
	async createAdmin(data: IAdmin) {
		try {
			const admin = new AdminModel(data);
			await admin.save();

			return admin;
		} catch (error) {
			throw error;
		}
	},

	async getRole(id: string) {
		try {
			const admin: { role: string } | null = await AdminModel.findOne({
				adminId: id,
			});
			console.log(admin);
			return admin;
		} catch (error) {
			throw error;
		}
	},

	async getId(id: string) {
		try {
			const admin: { _id: string } | null = await AdminModel.findOne({
				adminId: id,
			});
			console.log(admin);
			return admin;
		} catch (error) {
			throw error;
		}
	},

	async getAdminByEmail(email: string) {
		try {
			const admin = await AdminModel.findOne({
				email
			});
			return admin;
		} catch (error) {
			throw error;
		}
	},
};

export default AdminService;
