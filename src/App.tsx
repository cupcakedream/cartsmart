import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { ConfirmProvider } from './context/ConfirmContext';
import { GroceryProvider } from './context/GroceryContext';
import { AuthScreen } from './components/AuthScreen';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { neon } from './neon';
import { setStorage } from './storage';
import { NeonStorageAdapter } from './storage/NeonStorageAdapter';
import './App.css';

// Set once at module load — runs before any React rendering, never recreated.
setStorage(new NeonStorageAdapter(neon));

function AuthenticatedApp() {
  return (
    <GroceryProvider>
      <AppRoutes />
    </GroceryProvider>
  );
}

function AuthGate() {
  const session = neon.auth.useSession();
  const token = new URLSearchParams(window.location.search).get('token');

  if (session.isPending && session.data === undefined) {
    return <div className="loading">Loading&hellip;</div>;
  }

  // Token in URL = user clicked a password reset link in their email
  if (token && !session.data) {
    return (
      <ResetPasswordForm
        token={token}
        onDone={() => window.location.replace('/')}
      />
    );
  }

  if (!session.data) {
    return <AuthScreen />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ConfirmProvider>
        <AuthGate />
      </ConfirmProvider>
    </BrowserRouter>
  );
}
