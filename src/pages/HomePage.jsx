import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

const features = [
  { title: 'Multi-branch', desc: 'Centralized control with branch-level access.' },
  { title: 'Role-based', desc: 'Super Admin, Branch Admin, Employee, Delivery.' },
  { title: 'PWA ready', desc: 'Install on any device for offline-friendly access.' },
];

function HomePage() {
  return (
    <section className="animate-fade-up opacity-0-start">
      <div className="flex flex-col items-start gap-stellar-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="badge badge-accent">Camera Rentals ERP</span>
          <h1 className="mt-stellar-4 text-3xl font-bold sm:text-4xl">
            <span className="text-gradient-stellar">Stellar operations,</span>
            <br />
            simplified.
          </h1>
          <p className="mt-stellar-4 leading-relaxed text-stellar-text-muted">
            Manage inventory, bookings, branches, and deliveries from one premium
            dashboard — built for mobile-first teams in the field.
          </p>
          <div className="mt-stellar-8 flex flex-wrap gap-stellar-3">
            <Link to="/auth">
              <Button variant="primary">Get started</Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary">Sign in</Button>
            </Link>
          </div>
        </div>
        <Logo variant="full" className="mx-auto shrink-0 !h-28 opacity-95 sm:!h-36 sm:mx-0" />
      </div>

      <div className="mt-stellar-16 grid gap-stellar-4 sm:grid-cols-3">
        {features.map((card, i) => (
          <Card
            key={card.title}
            hover
            className={`animate-fade-up opacity-0-start stagger-${i + 1}`}
          >
            <Card.Title>{card.title}</Card.Title>
            <Card.Description className="mt-stellar-2">{card.desc}</Card.Description>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
