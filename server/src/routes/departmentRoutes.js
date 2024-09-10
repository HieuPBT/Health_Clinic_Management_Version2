import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { getDepartments } from "../controllers/departmentController.js";

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['patient']), getDepartments);

export default router;
