import express from 'express';
import otpController from '../controllers/otpController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and OTP verification endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WhatsappRequest:
 *       type: object
 *       required:
 *         - whatsapp
 *       properties:
 *         whatsapp:
 *           type: string
 *           description: WhatsApp number with country code
 *           example: "+919876543210"
 *     OtpVerifyRequest:
 *       type: object
 *       required:
 *         - whatsapp
 *         - otp
 *       properties:
 *         whatsapp:
 *           type: string
 *           description: WhatsApp number with country code
 *           example: "+919876543210"
 *         otp:
 *           type: string
 *           description: 6-digit OTP code sent to the WhatsApp number
 *           example: "123456"
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Error message details"
 */

/**
 * @swagger
 * /api/v1/auth/send-otp:
 *   post:
 *     summary: Send OTP via WhatsApp
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WhatsappRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 status: "success"
 *                 message: "OTP sent to WhatsApp"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-otp', otpController.sendOtp);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to WhatsApp
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerifyRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 status: "success"
 *                 message: "OTP verified successfully"
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 status: "error"
 *                 message: "Invalid or expired OTP"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-otp', otpController.verifyOtp);

export default router; 