import '../src/styles/globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;