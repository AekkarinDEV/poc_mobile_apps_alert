import { Request, Response, NextFunction } from 'express';
export declare const JWT_SECRET: string;
export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
        teamId: string | null;
    };
}
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map