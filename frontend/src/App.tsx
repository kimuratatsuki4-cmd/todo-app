import { useState, useEffect } from 'react'
import TodoForm from './components/TodoForm';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api/todo';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { register, login, logout, fetchLoginStatus } from './api/auth';
import Header from './components/Header';
import { CircleCheckBig, Circle, SquarePen, Trash2 } from 'lucide-react';

// ToDoの型をインターフェースとして定義する
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  // TypeScriptでは、useStateの呼び出し時にジェネリクス（例：<Todo[]>）を使うことで、状態変数の型を指定できます。
  // 今回管理する状態は「ToDo一覧」なので、Todo[]型を指定

  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setshowRegister] = useState(false);

  // ToDo一覧を取得し、状態変数を更新する関数
  async function syncTodos() {
    const todos = await fetchTodos();
    setTodos(todos);
  }

  // 認証トークンの有効期限切れエラーを処理
  function handleExpired(error: unknown) {
    if ((error as Error).message === 'EXPIRED') {
      setIsLoggedIn(false);
      setTodos([]);
      setEditingId(null);
      alert('セッションの有効期限が切れました。再度ログインしてください。');
    }
    return true;
  }


  //コンポーネントがマウントされたとき、初期化（初回作動時）の処理
  // [] =>「この処理は、コンポーネントが生まれた時（マウント時）に1回だけ実行して、あとは何があっても無視してね」**という合図
  useEffect(() => {
    async function initApp() {
      const status = await fetchLoginStatus();
      setIsLoggedIn(status);
      if (status) {
        try {
          await syncTodos();
        } catch (error) {
          console.log(error);
          // デフォルトではunknown型なので、型を明示する。
          alert((error as Error).message);
        }
      }
    }
    initApp();
  }, []);


  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        onClickLogout={async () => {
          try {
            await logout();
            setIsLoggedIn(false);
            setTodos([]);
            setEditingId(null);
            alert('ログアウトしました。');
          } catch (error) {
            alert((error as Error).message);
          }
        }}
        onClickLogin={() => setshowRegister(false)}
        onClickRegister={() => setshowRegister(true)}
      />

      <main>
        {isLoggedIn ? (
          <>
            <section className='todo-add-form-wrapper'>
              {/* 追加時の更新 */}
              <TodoForm onSubmit={async (title) => {
                try {
                  await addTodo(title);
                  await syncTodos();
                } catch (error) {
                  if (handleExpired(error)) return;
                  alert((error as Error).message);
                }
              }}
              ></TodoForm>
            </section>

            {/* 一覧の表示 */}
            <section className='todo-list-wrapper'>
              <ul>
                {todos.map((todo) => (
                  <li key={todo.id}>
                    {/* 編集ボタンが押されたときは、編集用フォームを表示する */}
                    {editingId === todo.id ? (
                      <div className='todo-edit-form-wrapper'>
                        <TodoForm onSubmit={async (title) => {
                          try {
                            await updateTodo(todo.id, title, todo.completed);
                            setEditingId(null);
                            await syncTodos();
                          } catch (error) {
                            if (handleExpired(error)) return;
                            alert((error as Error).message);
                          }
                        }}
                          // 編集時のフォームに既存タイトルを表示し、ボタンを【更新】へ変更
                          initialTitle={todo.title}
                          submitLabel='更新'
                        />
                        <div className='cancel-btn-wrapper'>
                          <button onClick={() => setEditingId(null)}>キャンセル</button>
                        </div>
                      </div>
                    ) : (
                      // 編集ボタンが押されていないときは、通常通り表示する。
                      <>
                        <div className='todo-next'>
                          <strong className='todo-title'>{todo.title}</strong>
                          <span className='todo-created-at'>
                            作成日時: {new Date(todo.createdAt).toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <div className='todo-btns'>
                          <button onClick={async () => {
                            try {
                              await updateTodo(todo.id, todo.title, !todo.completed);
                              await syncTodos();
                            } catch (error) {
                              if (handleExpired(error)) return;
                              alert((error as Error).message);
                            }
                          }}
                            style={{ marginRight: '0.5em' }}>{todo.completed ? <CircleCheckBig size={16} color="#10b981" /> : <Circle size={16} />}
                          </button>

                          <button onClick={() => setEditingId(todo.id)}
                            style={{ marginRight: '0.5em' }}><SquarePen size={16} /></button>

                          {/* 削除 */}
                          <button onClick={async () => {
                            if (!confirm('本当に削除しますか？')) {
                              return;
                            }
                            try {
                              await deleteTodo(todo.id);
                              await syncTodos();
                            } catch (error) {
                              if (handleExpired(error)) return;
                              alert((error as Error).message);
                            }
                          }}><Trash2 size={16} color="#ef4444" /></button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <section className='auth-wrapper'>
            <div className='auth-card'>
              <h2>{showRegister ? '会員登録' : 'ログイン'}</h2>
              {showRegister ? (
                <>
                  <RegisterForm onSubmit={async (email, password) => {
                    try {
                      await register(email, password);
                      setshowRegister(false);
                      alert('会員登録が完了しました。');
                    } catch (error) {
                      alert((error as Error).message);
                    }
                  }}>
                  </RegisterForm>
                </>
              ) : (
                <>
                  <LoginForm onSubmit={async (email, password) => {
                    try {
                      await login(email, password);
                      setIsLoggedIn(true);
                      alert('ログインしました。');
                      await syncTodos();
                    } catch (error) {
                      alert((error as Error).message)
                    }
                  }}>
                  </LoginForm>
                </>
              )}
              <div className='auth-toggle'>
                {showRegister ? (
                  <>
                    <span>すでにアカウントをお持ちですか？</span>
                    <button onClick={() => setshowRegister(false)}>ログイン</button>
                  </>
                ) : (
                  <>
                    <span>アカウントをお持ちではありませんか？</span>
                    <button onClick={() => setshowRegister(true)}>会員登録</button>
                  </>
                )}
              </div>
            </div>


          </section>
        )}
      </main>

    </>
  )

}

export default App
