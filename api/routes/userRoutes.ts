import express from 'express';
import UserService from '../services/userService';
import authMiddleware from '../middleware/auth';
import {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    DeleteResponse,
    ErrorResponse,
} from '../types/userTypes';
import { AuthenticatedRequest } from '../types/AuthentificatedRequest';
import CustomError from '../utils/customError';
import ApiResponse from '../utils/apiResponse';

const router = express.Router();
const userService = new UserService();

router.post(
    '/register',
    async (
        req: express.Request<{}, {}, RegisterRequest>,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const { email, username, password } = req.body;
            const user = await userService.registerUser(
                email,
                username,
                password
            );
            if (user) {
                res.status(201).json(
                    ApiResponse.success({
                        message: 'User registered successfully',
                    })
                );
            } else {
                throw new CustomError(400, 'Failed to register user');
            }
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/login',
    async (
        req: express.Request<{}, {}, LoginRequest>,
        res: express.Response
    ) => {
        const { email, password } = req.body;
        const tokens = await userService.loginUser(email, password);
        if (tokens) {
            res.json(ApiResponse.success(tokens));
        } else {
            res.status(401).json(ApiResponse.error('Invalid credentials'));
        }
    }
);

router.post('/refresh', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    const newAccessToken = await userService.refreshToken(refreshToken);
    if (newAccessToken) {
        res.json(ApiResponse.success({ accessToken: newAccessToken }));
    } else {
        res.status(401).json(ApiResponse.error('Invalid refresh token'));
    }
});

router.post('/logout', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    const success = await userService.logout(refreshToken);
    if (success) {
        res.json(ApiResponse.success({ message: 'Logged out successfully' }));
    } else {
        res.status(500).json(ApiResponse.error('Failed to logout'));
    }
});

router.delete(
    '/delete/:userId',
    authMiddleware,
    async (req: AuthenticatedRequest, res: express.Response) => {
        const { userId } = req.params;
        const success = await userService.deleteUser(userId);
        if (success) {
            res.json(
                ApiResponse.success({ message: 'User deleted successfully' })
            );
        } else {
            res.status(500).json(ApiResponse.error('Failed to delete user'));
        }
    }
);

export default router;
