import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'

// Google OAuth Client ID loaded from Vite environment with production fallback
const GOOGLE_CLIENT_ID_FALLBACK = '938924164898-ch4lvils61jkqp39cfl23pn2rkgrfggp.apps.googleusercontent.com';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID_FALLBACK;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
