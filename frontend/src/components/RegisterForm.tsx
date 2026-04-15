import { useState } from "react";
import type { SubmitEvent } from "react";

// 「このコンポーネントが受け取るデータの設計図（型定義）」**を作っているコード
// 親コンポーネントから子コンポーネントへ渡されるデータを「Props」と呼びますが、
// その中身が何であるかをあらかじめ決めておくためのものです。
type Props = {
    onSubmit: (email: string, password: string) => void;
};

function RegisterForm({ onSubmit }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('メールアドレスとパスワードを入力してください。');
            return;
        }
        if (password.trim().length < 8) {
            setError('パスワードは8文字以上で入力してください。');
            return;
        }
        // データを送信
        onSubmit(email, password);
        // 入力フォームなどのリセット
        setEmail('');
        setPassword('');
        setError('');
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <label htmlFor="email">メールアドレス</label>
            <br />
            <input type="email"
                id="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="メールアドレスを入力"
                autoComplete="email"
            />
            <br />
            <label htmlFor="password">パスワード</label>
            <br />
            <input type="password"
                id="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="パスワードを入力"
            />
            <br />
            <button type="submit">登録</button>
        </form>
    )
}

export default RegisterForm;
