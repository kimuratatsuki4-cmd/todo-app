import { Router } from "express";
import { query, exec } from "../db";

import { Request, Response } from "express";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: Date;
}

// router関連設定
const router = Router();

// errorhandler
function handleServerError(res: Response, error: unknown, message: string = 'サーバーエラー') {
    console.error('Server error:', error);
    res.status(500).json({ error: message });
}

// get(ToDoの全データを返すルート)
router.get('/', async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT id, title, completed, created_at AS createdAt FROM todos WHERE user_id = ? ORDER BY createdAt DESC';
        const params = [(req as any).user.id]
        const rows = await query<Todo>(sql, params);
        res.status(200).json(rows);
    } catch (error) {
        handleServerError(res, error);
    }

})

// ToDoを追加するルート
router.post('/', async (req: Request, res: Response) => {
    // bodyのtitleをString型であることを保証して取得する。
    const { title }: { title: string } = req.body;
    if (!title.trim()) {
        res.status(400).json({ error: 'ToDoを入力してください。' });
        return;
    }
    if (Number(title.trim().length) > 50) {
        res.status(400).json({ error: '文字数を50文字以下にしてください' });
        return;
    }
    try {
        const sql = 'INSERT INTO todos (title, completed, created_at, user_id) VALUES (?, ?, ?, ?)';
        const params = [title, false, new Date(), (req as any).user.id];
        await exec(sql, params);
        res.status(200).json({ message: 'ToDoを追加しました。' })
    } catch (error) {
        handleServerError(res, error);
    }
})

// ToDoを更新するルート
// 、ルートの定義時にコロン:を使うことで、URLの一部をパラメータとして扱うことができます。
router.put('/:id', async (req: Request, res: Response) => {
    const { title, completed }: { title: string, completed: boolean } = req.body;
    if (!title.trim()) {
        res.status(400).json({ error: 'ToDoを入力してください。' });
        return;
    }
    if (Number(title.trim().length) > 50) {
        res.status(400).json({ error: '文字数を50文字以下にしてください' });
        return;
    }
    try {
        const sql = 'UPDATE todos SET title = ?, completed = ? WHERE id = ? AND user_id = ?';
        const params = [title, completed, , req.params.id, (req as any).user.id];
        const result = await exec(sql, params);
        // resultが０件のときはエラーハンドリングを実施すること。
        if (result.affectedRows === 0) {
            res.status(404).json({ error: '指定されたToDoが見つかりません。' });
            return;
        }

        res.status(200).json({ message: 'ToDoを更新しました。' });
    } catch (error) {
        handleServerError(res, error);
    }
})

// ToDoを削除するルート
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const sql = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
        const params = [req.params.id, (req as any).user.id];
        const result = await exec(sql, params);
        if (result.affectedRows === 0) {
            res.status(400).json({ error: '指定されたToDoが見つかりません。' });
            return;
        }
        res.status(200).json({ message: 'TODOを削除しました。' });
    } catch (error) {
        handleServerError(res, error);
    }
});

export default router;