import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { getMedicines } from "../controllers/medicineController.js";

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['doctor']), getMedicines);

export default router;
