import { Router } from "express";
import { query, exec } from "../db";
import { generateToken, verifyToken } from "../jwt";
import bcrypt from 'bcrypt';

import type { Request, Response } from "express";

interface User {
    id: number;
    email: string;
    password: string;
}

const router = Router();

// ユーザー登録ルート
router.post('/register', async (req: Request, res: Response) => {
    const { email, password }: { email: string, password: string } = req.body;
    if (!email.trim() || !password.trim()) {
        res.status(400).json({ error: 'メールアドレスとパスワードを入力してください。' })
    }
    if (password.trim().length < 8) {
        res.status(400).json({ error: 'パスワードは8文字以上で入力してください。' })
    }

    try {
        const checkSql = 'SELECT * FROM users WHERE email = ?;';
        const checkParams = [email];
        const existingUsers = await query<User>(checkSql, checkParams);
        if (existingUsers.length > 0) {
            res.status(409).json({ error: 'そのメールアドレスはすでに登録済みです。' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const insertSql = 'INSERT INTO users (email, password) VALUES (?, ?);'
        const insertParams = [email, hashed];
        await exec(insertSql, insertParams);
        res.status(201).json({ message: '会員登録に成功しました。' })
    } catch (error) {
        res.status(500).json({ error: 'データベースエラーが発生しました。' });
    }
})

// ログインルート
router.post('/login', async (req: Request, res: Response) => {
    const { email, password }: { email: string, password: string } = req.body;
    if (!email.trim() || !password.trim()) {
        res.status(400).json({ error: 'メールアドレスとパスワードを入力してください。' })
    }
    if (password.trim().length < 8) {
        res.status(400).json({ error: 'パスワードは8文字以上で入力してください。' })
    }
    try {
        const sql = 'SELECT * FROM users WHERE email = ?;';
        const params = [email];
        const rows = await query<User>(sql, params);
        const user = rows[0];
        // User有無
        if (!user) {
            res.status(401).json({ error: 'ユーザーが存在しません。' });
        }
        // password 確認
        const isMatch = await bcrypt.compare(password, user!.password);
        if (!isMatch) {
            res.status(401).json({ error: 'パスワードが間違っています。' });
            return;
        }
        // トークン生成
        const token = generateToken({ id: user?.id, email: user?.email });
        // 認証トークンをクッキーに保存('authToken'という名前で認証トークンを保存)
        res.cookie('authToken', token, {
            httpOnly: true, //javascriptからのアクセス禁止
            secure: process.env.NODE_ENV === 'production', //本番環境ではHTTPSを利用
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', //別サイトからのリクエスト時にクッキーを送信しない（CSRF対策）
            maxAge: 60 * 60 * 1000, //有効期限
        })

        res.status(200).json({ message: 'ログインに成功しました。' })
    } catch (error) {
        res.status(500).json({ error: 'データベースエラーが発生しました。' });
    }
})

// ログアウト用のルート
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('authToken');
    res.status(200).json({ message: 'ログアウトしました。' });
})


// ログイン済みかどうか確認するルート
router.get('/check', verifyToken, (req: Request, res: Response) => {
    res.status(200).json({ message: 'ログイン済みです。' });
})

export default router;