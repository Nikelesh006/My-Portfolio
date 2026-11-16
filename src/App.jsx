import { useEffect } from 'react';
import Home from './pages/Home';

export default function App() {
  useEffect(() => {
    // If loaded on /experience or /experience/, redirect to /#experience
    const path = window.location.pathname.toLowerCase();
    if (path === '/experience' || path === '/experience/') {
      window.history.replaceState(null, '', '/#experience');
    }
  }, []);

  return <Home />;
}
