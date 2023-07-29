import { useState } from 'react'
import './App.css'
import {auth} from './firebase';
import { signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [totp, setTOTP] = useState("");
  const [temporaryToken, setTemporaryToken] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        if (!error.message.includes('need-totp-auth')) {
          setError(error.message);
          return;

        }
        const token = JSON.parse(error.message.match(/returned HTTP error 499: ({.*})\)/)?.[1] ?? '{}')?.error.details.token ?? '';

        setTemporaryToken(token);
      });
  };

  const handleLoginForTOTP = async () => {
    const res = await fetch(`/createCustomClaim`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: temporaryToken,
        totp,
      })
    });

    if (!res.ok) {
      setTemporaryToken('');
      setError('Fail TOTP');
    }

    const {customToken} = await res.json();

    const userCredential = await signInWithCustomToken(auth, customToken);

    console.log(userCredential);
    setIsLoggedIn(true);
  };

  return (
    <div>
      {isLoggedIn && <div>
         Success!!!
      </div>}
      {!isLoggedIn && !temporaryToken && <div>
        <h2>Login</h2>
        {error && <div>{error}</div>}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button id="sign-in-button" onClick={handleLogin}>Login</button>
        </div>
      </div>}
    {!isLoggedIn && !!temporaryToken && <div>
        <input
          type="text"
          value={totp}
          onChange={(e) => setTOTP(e.target.value)}
        />
        <button onClick={handleLoginForTOTP}>verify</button>
      </div>}
    </div>
  );
};

export default App;
