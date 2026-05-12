import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "No token provided" });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as { userId: string };

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}