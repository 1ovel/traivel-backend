import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/customError';
import ApiResponse from '../utils/apiResponse';

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json(ApiResponse.error(err.message));
    }

    console.error(err);
    res.status(500).json(ApiResponse.error('Unexpected internal server error'));
};

export default errorHandler;
