import { TicketModel } from "../models/ticket";
import { ITicket } from "../utils/types/custom";

const TicketService = {
	async createTicket(data: ITicket) {
		try {
			const ticket = new TicketModel(data);
			await ticket.save();

			return ticket;
		} catch (error) {
			throw error;
		}
	},

	async findTicket(userId: any, ticketId: string) {
		try {
			const ticket = await TicketModel.findOne({
				userId,
				ticketId,
			});

			return ticket;
		} catch (error) {
			throw error;
		}
	},

	async getAllTickets(userId: any, query: any) {
		try {
			const tickets = await TicketModel.find({
				userId,
				status: {
					$in: query.status,
				},
				createdAt: {
					$gte: new Date(query.startDate),
					$lt: new Date(query.endDate),
				},
			});

			return tickets;
		} catch (error) {
			throw error;
		}
	},

	async findTicketById(ticketId: string) {
		try {
			const ticket = await TicketModel.findOne({
				ticketId,
			});

			return ticket;
		} catch (error) {
			throw error;
		}
	},

	async updateTicketcomment(ticketId: string, comment: any) {
		try {
			const ticket: any = await this.findTicketById(ticketId);
			
			return ticket;
		} catch (error) {
			throw error;
		}
	},
};

export default TicketService;
