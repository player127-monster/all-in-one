import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton: React.FC = () => {
  const { login } = useAuth();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async (response: any) => {
    try {
      const { credential } = response;
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.data.token, data.data.user);
        toast.success('Successfully logged in!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const renderGoogleButton = () => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 200,
          text: 'sign_in_with'
        }
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(renderGoogleButton, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div id="google-login-button"></div>
      <noscript>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Sign in with Google
        </div>
      </noscript>
    </div>
  );
};

export default GoogleLoginButton;