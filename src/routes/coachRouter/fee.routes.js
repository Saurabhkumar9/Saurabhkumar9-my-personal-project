// In your routes file (admin.routes.js)
import express from "express";
import { payFee,UnpayFee,payFeeCurrentMonth } from "../../controllers/coachController/fee.controller.js";


const FeeRouter = express.Router();

// Coach routes

FeeRouter.post('/pay/fee',payFee )
FeeRouter.post('/unpay/fee',UnpayFee )
FeeRouter.post('/pay/fee/multiple-student/currentmonth',payFeeCurrentMonth )



export default FeeRouter;