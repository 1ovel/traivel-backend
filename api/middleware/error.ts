import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/customError';

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.statusCode,
                message: err.message,
            },
        });
    }

    console.error(err);
    res.status(500).json({
        error: {
            code: 500,
            message: 'Unexpected internal server error',
        },
    });
};

export default errorHandler;
