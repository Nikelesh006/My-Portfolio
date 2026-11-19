import { useEffect } from 'react';
import Home from './pages/Home';

export default function App() {
  useEffect(() => {
    // If loaded on /experience or /about, redirect to hash section
    const path = window.location.pathname.toLowerCase();
    if (path === '/experience' || path === '/experience/') {
      window.history.replaceState(null, '', '/#experience');
    } else if (path === '/about' || path === '/about/') {
      window.history.replaceState(null, '', '/#about');
    } else if (path === '/skills' || path === '/skills/') {
      window.history.replaceState(null, '', '/#skills');
    }
  }, []);

  return <Home />;
}
