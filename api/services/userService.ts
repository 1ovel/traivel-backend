import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const prisma = new PrismaClient();

export default class UserService {
    async registerUser(
        email: string,
        username: string,
        password: string
    ): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await prisma.user.create({
                data: { email, username, password: hashedPassword },
            });
            return user;
        } catch (error) {
            console.error('Error registering user:', error);
            return null;
        }
    }

    async loginUser(
        email: string,
        password: string
    ): Promise<{ accessToken: string; refreshToken: string } | null> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.REFRESH_SECRET;
        if (!jwtSecret || !refreshSecret) {
            console.error(
                'JWT_SECRET or REFRESH_SECRET is not set in environment variables'
            );
            return null;
        }

        const accessToken = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '15m',
        });
        const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, {
            expiresIn: '7d',
        });

        // Store refresh token in the database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<string | null> {
        const refreshSecret = process.env.REFRESH_SECRET;
        const jwtSecret = process.env.JWT_SECRET;
        if (!refreshSecret || !jwtSecret) {
            console.error(
                'REFRESH_SECRET or JWT_SECRET is not set in environment variables'
            );
            return null;
        }

        try {
            const decoded = jwt.verify(refreshToken, refreshSecret) as {
                userId: string;
            };
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                return null;
            }

            const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                jwtSecret,
                { expiresIn: '15m' }
            );
            return newAccessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        try {
            await prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            await prisma.user.delete({ where: { id: userId } });
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }
}
