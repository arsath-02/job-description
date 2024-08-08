import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';

function SignInPage() {
  const location = useLocation();
  const isLogin = location.pathname === '/auth/sign-in';

  return (
    <div>
      {isLogin ? <Login /> : <Register />}
      <Link to={isLogin ? '/auth/sign-up' : '/auth/sign-in'}>
        <button>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </Link>
    </div>
  );
}

export default SignInPage;
