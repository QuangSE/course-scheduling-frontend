import React, { useState } from "react";


function LoginForm({ Login, Error }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const submitHandler = (e) => {
        e.preventDefault(); //prevent a browser reload/refresh
        Login(username, password);
    };
    return (
        <form onSubmit={submitHandler}>
            <div>
                <h2>Login</h2>
                <div className="login-form">
                    <label htmlFor="username">Benutzername</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        placeholder="Benutzername"
                        required
                    />
                </div>
                <div className="login-form">
                    <label htmlFor="password">Passwort</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passwort"
                        required
                    />
                </div>
                <input type="submit" value="Login" />
            </div>
        </form>
    );
}

export default LoginForm;
