import { Router } from "express";
import { AuthService } from "../services/AuthService";

const router = Router();

router.post("/login", async (request, response) => {
  const session = await AuthService.login(request.body.username);
  return response.json(session);
});

export default router;
