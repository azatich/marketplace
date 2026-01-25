import express from "express";
import { AuthController } from "../controllers/authController";

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/signup-seller', AuthController.sellerSignup);
router.post('/logout', AuthController.logout)
router.get('/me', AuthController.getUser)


export default router;
