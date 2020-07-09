import { Router } from "express";
import * as TicketController from "../controllers/TicketController";
import { authToken, authUser } from "../middlewares/Auth";

const router = Router();

router.post("/", authToken, authUser, TicketController.newTicket);
router.get("/history", authToken, authUser, TicketController.getAllTickets);
router.get("/:id", authToken, authUser, TicketController.getTicket);
router.put("/:id", authUser, authUser, TicketController.updateTicket);

export default router;
