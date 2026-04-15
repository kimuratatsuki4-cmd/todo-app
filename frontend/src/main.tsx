// main.tsxファイルは、Reactプロジェクト（フロントエンド）のエントリーポイントです。

// 用語	説明
// エントリーポイント	アプリの中で一番最初に実行される場所のこと。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
