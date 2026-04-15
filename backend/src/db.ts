import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// RowDataPacketはmysql2において「1行分のレコード」を表す型
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

dotenv.config();

// 接続設定
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,  // Macの場合は8889
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || ''
};

const pool = mysql.createPool(dbConfig);
// pool破棄の関数
export async function closePool() {
    try {
        await pool.end();
        console.log('データベース接続プールを破棄しました。');
    } catch (error) {
        console.error('データベース接続プールの破棄中にエラーが発生しました：', error);
    }
}

// SQL実行
// 
export async function query<T = any>(sql: string, params: any[] = []) {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
        return rows as T[];
    } catch (error) {
        console.error('SQLの実行中にエラーが発生しました：', error);
        throw error;
    }
}

export async function exec(sql: string, params: any[] = []) {
    try {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);
        return result;
    } catch (error) {
        console.error('SQLの実行中にエラーが発生しました：', error);
        throw error;
    }
}


// 1. <T = any>（関数の入口でのジェネリクス）
// これは「この関数を実行するときに、好きな型（T）を指定できますよ。もし指定がなければとりあえず any（なんでもあり）として扱います」という定義です。

// T: 型変数（Typeの略）。関数を呼び出すときに、中身が「ToDo型」なのか「User型」なのかを外から注入できます。

// = any: デフォルト値の設定です。

// 2. <RowDataPacket[]>（ライブラリへの型指定）
// mysql2 ライブラリの pool.execute メソッドは、内部でジェネリクスを受け取れるようになっています。
// RowDataPacket[] を指定することで、**「データベースから返ってくる生の結果は、MySQL標準の行データ（RowDataPacket）の配列ですよ」**と TypeScript に伝えています。