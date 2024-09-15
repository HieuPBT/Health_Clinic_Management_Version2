import express from 'express'
import { createMoMo, ipnMoMo, queryMoMo, refundMoMo, confirmMoMo, createZaloPay, callbackZaloPay, createVNPay, ipnVnpay } from "../controllers/paymentController.js"

const router = express.Router();

router.post('/create-momo', createMoMo);
router.post('/query-momo', queryMoMo);
router.post('/confirm-momo', confirmMoMo);
router.post('/ipn-momo', ipnMoMo);
router.post('/refund-momo', refundMoMo);
router.post('/create-zalopay', createZaloPay);
router.post('/callback-zalopay', callbackZaloPay);
router.post('/create-vnpay', createVNPay);
router.get('/ipn-vnpay', ipnVnpay);

export default router;
