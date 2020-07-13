import { ObjectID } from "mongodb";
import { uuid } from 'uuidv4';
import { UserModel } from "./../../models/user";
import { AdminModel } from "./../../models/admin";
import { TicketModel } from "../../models/ticket";

const users = [
	{
		_id: new ObjectID(),
		name: "Jane Doe",
		email: "dummy1@mail.com",
		password: "password",
	},
	{
		name: "Rex Fox",
		email: "dummy@example.com",
		password: "password",
	},
];
const admin = [
	{
		name: "John Doe",
		email: "john@mail.com",
		password: "password",
		role: "admin"
	},
	{
		_id: new ObjectID(),
		name: "Jane Doe",
		email: "dummy@example.com",
		password: "password",
		role: "agent"
	},
];

const tickets = [
	{
		subject: "Ticket one",
		content: "content content content",
		userId: users[0]._id,
		ticketId: uuid(),
	},
	{
		subject: "Ticket one",
		content: "content content content",
		userId: users[0]._id,
		ticketId: uuid(),
		meta: {
			comments: [{comment: "admin comment", commenter: admin[1]._id, onModel: "admin"}]
		},
		isOpenForComment: true
	},
];
const seedUsers = async () => {
    try {
		await UserModel.deleteMany({});
		const u1 = new UserModel(users[0]);
		await u1.save();
		const u2 = new UserModel(users[1]);
		await u2.save();
    } catch (error) {
        console.log("SEED", error);
    }
};

const seedAdmin = async () => {
    try {
		await AdminModel.deleteMany({});
		const a1 = new AdminModel(admin[0]);
		await a1.save();
		const a2 = new AdminModel(admin[1]);
		await a2.save();
    } catch (error) {
        console.log("SEED", error);
    }
};

const seedTickets = async () => {
    try {
		await TicketModel.deleteMany({});
		await TicketModel.insertMany(tickets);
    } catch (error) {
        console.log("SEED", error);
    }
};

export { users, seedUsers, admin, seedAdmin, tickets, seedTickets };