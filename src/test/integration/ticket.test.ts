import expect from "expect";
import request from "supertest";
import { app } from "./../../app";
import { seedUsers, users, admin, seedAdmin, tickets, seedTickets } from "./../seed/seed";

beforeEach(async function () {
	await seedUsers();
	await seedAdmin();
	await seedTickets();
});
describe("Ticket", async () => {
	let user: any;
	let admin: any;
	beforeEach(async () => {
		user = await loginUser();
		admin = await loginAdmin();
	});

	describe("POST: create a ticket", () => {
		it("should create a new ticket when an authenticated user try to create", (done) => {
			const ticket = {
				subject: "This is a test",
				content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
			};

			request(app)
				.post("/api/v1/ticket")
				.set("Authorization", `bearer ${user.body.data.token}`)
				.send(ticket)
				.expect(201)
				.expect((res) => {
					expect(res.body.data).toHaveProperty("ticket");
					expect(res.body.data.ticket).toHaveProperty("ticketId");
					expect(res.body.data.ticket.subject).toBe(ticket.subject);
				})
				.end(done);
		});

		it("should return 400 if required fields are missing", (done) => {
			const ticket = {};

			request(app)
				.post("/api/v1/ticket")
				.set("Authorization", `bearer ${user.body.data.token}`)
				.send(ticket)
				.expect(400)
				.end(done);
		});

		

		
	});

	describe("GET Ticket", () => {
		it("should return a ticket created by the authenticated user", (done) => {
			request(app)
				.get(`/api/v1/tickets/${tickets[0].ticketId}`)
				.set("Authorization", `bearer ${user.body.data.token}`)
				.expect(200)
				.expect((res) => {
					expect(res.body.data.ticket).toHaveProperty("ticketId");
				})
				.end(done);
		});

		it("should return a ticket created by a user to the admin", (done) => {
			request(app)
				.get(`/api/v1/admin/tickets/${tickets[1].ticketId}`)
				.set("Authorization", `bearer ${admin.body.data.token}`)
				.expect(200)
				.expect((res) => {
					expect(res.body.data.ticket.ticketId).toBe(tickets[1].ticketId);
				})
				.end(done);
		});
	});
});

async function loginUser() {
	return request(app)
		.post("/api/v1/login")
		.send({
			email: users[0].email,
			password: users[0].password,
		});
}

async function loginAdmin() {
	return request(app)
		.post("/api/v1/admin/login")
		.send({
			email: admin[1].email,
			password: admin[1].password,
		});
}