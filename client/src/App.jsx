import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return window.location.pathname === '/' ? <Home /> : <NotFound />;
}
