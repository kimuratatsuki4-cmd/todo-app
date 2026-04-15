import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { closePool } from './db'
import todoRouters from './route/todo';
import cookieParser from 'cookie-parser';
import authRouters from './route/auth';
import { verifyToken } from './jwt';

// 型のインポート
import { Request, Response } from 'express';


// envファイルを読み込む
dotenv.config();

const port = Number(process.env.PORT) || 3000;
const app = express();

// cors setting
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true //フロントエンドからバックエンドへの認証情報の送信を許可する
}))

// app初期設定(json,cookieParser,routerへの受け渡し)
app.use(express.json());
app.use(cookieParser());
app.use('/api/todos', verifyToken, todoRouters);
app.use('/api/auth', authRouters);


//404Notfound 処理
app.use((req: Request, res: Response) => {
    res.status(404).set('Content-Type', 'text/html; charset=utf-8');
    res.send('<h1>ページが見つかりませんでした。</h1>');
})

// DB接続破棄処理
const lists = ['SIGINT', 'SIGTERM', 'SIGHUP'];
lists.forEach(signal => {
    process.on(signal, async () => {
        console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
        await closePool();
        process.exit();
    })
})


// webサーバーの起動
app.listen(port, () => {
    console.log('Web server launched');
})

