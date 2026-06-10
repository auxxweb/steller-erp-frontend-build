import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <p className="text-6xl font-bold text-stellar-text-subtle">404</p>
      <h1 className="mt-stellar-4 text-xl font-semibold text-stellar-text">Page not found</h1>
      <p className="mt-stellar-2 max-w-sm text-sm text-stellar-text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="mt-stellar-8">
        <Button variant="primary">Go home</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
