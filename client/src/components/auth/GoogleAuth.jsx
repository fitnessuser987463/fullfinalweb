import React from 'react';
import { GoogleLogin } from '@google-oauth/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleAuth = ({ buttonText = "Continue with Google", onSuccess, onError }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      const googleData = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture
      };

      console.log('Google OAuth Success:', googleData);

      const result = await login(googleData);
      if (result.success) {
        toast.success('Login successful!');
        if (onSuccess) {
          onSuccess(result);
        } else {
          navigate('/home');
        }
      } else {
        toast.error(result.error);
        if (onError) onError(result.error);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
      if (onError) onError(error);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth Error:', error);
    toast.error('Google authentication failed');
    if (onError) onError(error);
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        auto_select={false}
        width="100%"
        theme="filled_blue"
        size="large"
        text={buttonText.includes('Sign up') ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        locale="en"
      />
    </div>
  );
};

export default GoogleAuth;