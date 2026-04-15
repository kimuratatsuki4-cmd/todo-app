import jwt, { TokenExpiredError } from "jsonwebtoken";
// import type
import type { Request, Response, NextFunction } from "express";
import { error } from "node:console";
// generate secret key
function getSecretKey() {
    const key = process.env.JWT_SECRET_KEY;
    if (!key) {
        throw new Error('環境変数JWT_SECRET_KEYが設定されていません。')
    }
    return key;
}

// jwtの秘密鍵
const SECRET_KEY = getSecretKey();

// JWTの有効期限
const EXPIRES_IN = '1h';

// 認証トークンを生成する関数
export function generateToken(payload: object) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
}

// 認証トークンを検証するミドルウェア関数(自作分)
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.authToken;
    if (!token) {
        res.status(200).json({ error: '認証トークンがありません。' });
        return;
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded;
        // 次のミドルウェアやルートに進めるための関数
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            res.status(440).json({ error: '認証トークンが有効期限切れです。' });
            return
        }
        return res.status(401).json({ error: '認証トークンが無効です。' })
    }
}