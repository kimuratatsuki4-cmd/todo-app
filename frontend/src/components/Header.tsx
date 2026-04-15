import { UserPlus, LogIn, LogOut } from "lucide-react"; //アイコンフォントのインストール

type Props = {
    isLoggedIn: boolean;
    onClickLogout: () => void;
    onClickLogin: () => void;
    onClickRegister: () => void;
};

function Header({ isLoggedIn, onClickLogout, onClickLogin, onClickRegister }: Props) {
    return (
        <header>
            <nav>
                <h1>ToDOアプリ</h1>
                <ul>
                    {isLoggedIn ? (
                        <li>
                            <button onClick={onClickLogout}>
                                <LogOut>
                                    <span>ログアウト</span>
                                </LogOut>
                            </button>
                        </li>
                    ) : (
                        <>
                            <li>
                                <button onClick={onClickLogin}>
                                    <LogIn>
                                        <span>ログイン</span>
                                    </LogIn>
                                </button>
                            </li>
                            <li>
                                <button onClick={onClickRegister}>
                                    <UserPlus>
                                        <span>会員登録</span>
                                    </UserPlus>
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    )
}

export default Header;