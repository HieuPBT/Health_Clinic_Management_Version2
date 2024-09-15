import axios from "axios";
import crypto from "crypto";
import { baseUrls, endpoints } from "../utils/API.js";
import moment from "moment";
import Invoice from "../models/Invoice.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import querystring from "qs";
import dateFormat from "dateformat";

var accessKey = process.env.MOMO_ACCESS_KEY;
var secretkey = process.env.MOMO_SECRET_KEY;
var partnerCode = "MOMO";


export const createMoMo = async (req, res) => {
    const {
        orderInfo,
        amount,
        redirectUrl,
        ipnUrl,
        autoCapture,
        lang,
    } = req.body;
    var partnerCode = "MOMO";
    var requestId = partnerCode + "_" + new Date().getTime();
    var orderId = requestId;
    // var orderInfo = "Thanh toán với MoMo";
    var requestType = "captureWallet";
    var extraData = "";

    var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

    try {
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: lang,
            autoCapture: autoCapture
        });


        const result = await axios.post(
            `${baseUrls.momo}${endpoints['create-momo']}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        res.json(result.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi!,không thể thanh toán với MoMo' });
    }
};

export const ipnMoMo = async (req, res) => {
    const {
        message,
        resultCode,
        orderId,
    } = req.body
    console.log(req.body);
    if (resultCode === 0) {
        try {

            const invoice = await Invoice.findOneAndUpdate(
                { orderId: orderId },
                { paymentStatus: 'COMPLETED' },
                { new: true }
            );

            if (invoice) {
                const pres = await Prescription.findById(
                    invoice.prescription
                );

                if (pres) {
                    await Appointment.findByIdAndUpdate(
                        pres.appointment,
                        { status: 'ĐÃ THANH TOÁN' }
                    );
                }
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái", error);
        }
        console.log("Thành công")
    }
    else console.log("Thất bại")

    res.json({ "resultCode": resultCode, "message": message });
}

export const queryMoMo = async (req, res) => {
    const {
        orderId
    } = req.body
    var partnerCode = "MOMO";
    var requestId = partnerCode + "_" + new Date().getTime();
    var secretkey = process.env.MOMO_SECRET_KEY;
    var accessKey = process.env.MOMO_ACCESS_KEY;

    var rawData = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;

    var signature = crypto.createHmac('sha256', secretkey).update(rawData).digest('hex');

    try {
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            requestId: requestId,
            orderId: orderId,
            lang: "en",
            signature: signature,
        });
        console.log(requestBody);

        const result = await axios.post(`${baseUrls.momo}${endpoints['query-momo']}`, requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log(result);
        res.json(result.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi!,không thể tra cứu trạng thái với MoMo' });
    }
}

export const confirmMoMo = async (req, res) => {
    const {
        orderId,
        requestType,
        amount,
        description,
    } = req.body;

    var requestId = partnerCode + "_" + new Date().getTime();


    var rawData = `accessKey=${accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&requestType=${requestType}`;


    var signature = crypto.createHmac('sha256', secretkey).update(rawData).digest('hex');

    try {
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            requestId: requestId,
            orderId: orderId,
            requestType: requestType,
            amount: amount,
            lang: 'en',
            description: description,
            signature: signature,
        })

        console.log(requestBody);

        const result = await axios.post(`${baseUrls.momo}${endpoints['confirm-momo']}`, requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        // console.log(rawData);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi xác nhận momo", data: error.data });

    }
}

export const refundMoMo = async (req, res) => {
    const {
        amount,
        transId,
        description,
        lang
    } = req.body;

    var requestId = partnerCode + "_" + new Date().getTime();

    var rawSignature = `accessKey=${accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${transId}`;
    var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

    try {
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            orderId: requestId,
            requestId: requestId,
            amount: amount,
            transId: transId,
            lang: lang,
            description: description,
            signature: signature
        })

        const result = await axios.post(`${baseUrls.momo}${endpoints['refund-momo']}`, requestBody,
            {
                headers: {
                    'Content-Type': "application/json"
                }
            }
        )
        console.log(result);
        res.json(result.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi hoàn tiền MoMo" });
    }

}

export const createZaloPay = async (req, res) => {
    const {
        amount,
        callback_url,
        redirecturl
    } = req.body

    const config = {
        app_id: Number(process.env.ZALOPAY_APP_ID),
        key1: process.env.ZALOPAY_KEY1,
        key2: process.env.ZALOPAY_KEY2,
    };

    const embed_data = { "redirecturl": redirecturl };
    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: "user123",
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: "Thanh toán với ZaloPay",
        bank_code: "zalopayapp",
        callback_url: callback_url
    };

    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|"
        + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;

    order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

    try {

        console.log(order);
        const result = await axios.post(baseUrls['zalopay'] + endpoints['create-zalopay'], order);

        res.json(result.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi!,không thể thanh toán với ZaloPay' });
    }

}

export const callbackZaloPay = async (req, res) => {
    const {
        return_code,
        return_message,
    } = req.body

    console.log(req.body.data);
    let result = {};
    const config = {
        key2: process.env.ZALOPAY_KEY2,
    }

    try {
        console.log(req.body);
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = crypto.createHmac('sha256', config.key2).update(dataStr).digest('hex');
        console.log("mac", mac);

        if (reqMac !== mac) {
            console.log("mac not equal");
            result.return_code = -1;
            result.return_message = "mac not equal";
        }
        else {
            console.log("Mac equals");
            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        console.log("Lỗi mac");
        result.return_code = 0;
        result.return_message = ex.message;
    }

    res.json(result);

    // if(return_code === 1){
    //     console.log("Thành công thanh toán ZaloPay")
    // } else console.error("Thất bại")

    // res.json({"return_code": return_code, "return_message": return_message});

}

const formatDate = (date) => {
    return date.getFullYear().toString() +
           ('0' + (date.getMonth() + 1)).slice(-2) +
           ('0' + date.getDate()).slice(-2) +
           ('0' + date.getHours()).slice(-2) +
           ('0' + date.getMinutes()).slice(-2) +
           ('0' + date.getSeconds()).slice(-2);
};

export const createVNPay = (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNPAY_TMN_CODE;
    let secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = process.env.VNPAY_RETURN_URL;
    let orderId = moment(date).format('DDHHmmss');
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let locale = req.body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    // let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    // let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
    res.json({payUrl: vnpUrl});
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export const ipnVnpay = (req, res, next) => {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var secretKey = process.env.VNPAY_HASH_SECRET;
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");


    if (secureHash === signed) {
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];
        console.log(rspCode);
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        res.status(200).json({ RspCode: '00', Message: 'success' })
    }
    else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
    }
}
