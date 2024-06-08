import auth from 'basic-auth';
import { NextFunction, Request, Response } from 'express';

export default class UserService {
    private apiPassword: string;

    constructor() {
        if (!process.env.API_PASSWORD) {
            throw new Error('API password not defined');
        }
        this.apiPassword = process.env.API_PASSWORD ?? '';
        this.authenticate = this.authenticate.bind(this);
    }
    public authenticate(req: Request, res: Response, next: NextFunction) {
        const credentials = auth(req);

        if (!credentials || credentials.pass !== this.apiPassword) {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="example"');
            res.end('Access denied');
        } else {
            next();
        }
    }
}
