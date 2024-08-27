import express from 'express'
import { createMoMo, ipnMoMo, createZaloPay, callbackZaloPay } from "../controllers/paymentController.js"

const router = express.Router();

router.post('/create-momo', createMoMo);
router.post('/ipn-momo', ipnMoMo);
router.post('/create-zalopay', createZaloPay);
router.post('/callback-zalopay', callbackZaloPay);

export default router;