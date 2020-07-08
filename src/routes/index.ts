import { Request, Response, Router } from "express";
// import UserRouter from "./Users";
// import TicketRouter from "./Ticket";
// import { search } from "../controllers/TeamController";
import AdminRouter from "./Admin";
import {http_responder} from "../utils/http_response";

// Init router and path
const router = Router();

router.use("/health", (req: Request, res: Response) => {
	const message = "CSTS Server is up & Running";
	return http_responder.successResponse(res, [], message);
});

// Add sub-routes

// router.get("/search/:search", search);
// router.use("/users", UserRouter);
// router.use("/teams", TeamRouter);
router.use("/admin", AdminRouter);

// Export the base-router
export default router;
