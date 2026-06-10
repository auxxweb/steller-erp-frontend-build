import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

function AuthLayout() {
  return (
    <div className="dashboard-shell relative flex min-h-screen min-h-[100dvh] flex-col items-center justify-center px-stellar-4 py-stellar-10">
      {/* Ambient cinematic gradient */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[50vh] w-[50vw] rounded-full bg-stellar-silver/20 blur-3xl dark:bg-stellar-graphite/30" />
        <div className="absolute -right-1/4 bottom-0 h-[40vh] w-[40vw] rounded-full bg-stellar-silver/15 blur-3xl dark:bg-stellar-charcoal/40" />
      </div>

      <div className="absolute right-stellar-4 top-stellar-4 z-10 sm:right-stellar-6 sm:top-stellar-6">
        <ThemeToggle />
      </div>

      <div className="relative z-[1] w-full flex justify-center">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
