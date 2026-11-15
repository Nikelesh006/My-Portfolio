import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Experience from './pages/Experience';

function getRoute() {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (
    path === '/experience' ||
    path === '/experience/' ||
    hash === '#experience' ||
    hash === '#/experience'
  ) {
    return 'experience';
  }
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  return route === 'experience' ? <Experience /> : <Home />;
}
