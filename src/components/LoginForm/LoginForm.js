import React, { useState } from 'react';
import './loginForm.css';

function LoginForm({ login, setRegister, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault(); //prevent a browser reload/refresh
    login(username, password);
  };

  function onRegisterClick() {
    setRegister(true);
  }
  return (
    <form onSubmit={submitHandler}>
      <div className="login-form">
        <h2>Login</h2>
        <div className="input-container">
          {/*           <label htmlFor="username">Benutzername</label> */}
          <input
            autoFocus={true}
            type="text"
            name="username"
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="Benutzername"
            required
          />
        </div>
        <div className="input-container">
          {/*           <label htmlFor="password">Passwort</label> */}
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
        <div className="btn-container">
          <input type="submit" value="Login" />
          <input type="button" value="Registrierung" onClick={onRegisterClick} />
          <div style={{ color: 'red', paddingTop: '10px' }}>
            {error ? 'Anmeldedaten sind ungültig' : null}
          </div>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
