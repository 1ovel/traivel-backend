import { Request } from 'express';

export interface AuthenticatedRequest<T = any> extends Request {
    userId?: string;
    body: T;
}
