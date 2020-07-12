import { Router } from "express";
import * as TicketController from "../controllers/TicketController";
import { authToken, authUser, authAdmin } from "../middlewares/Auth";

const router = Router();

router.post("/", authToken, authUser, TicketController.newTicket);
router.get("/history", authToken, authUser, TicketController.getUserTickets);
router.get("/", authToken, authAdmin, TicketController.getAllTickets);
router.get("/report", authToken, authAdmin, TicketController.getTicketsReport);
router.get("/:id", authToken, authUser, TicketController.getTicket);
router.put("/:id", authToken, authUser, TicketController.userCommentOnTicket);

export default router;
