function PlaceholderPage({ title, description }) {
  return (
    <div className="animate-fade-up opacity-0-start">
      <h1 className="text-xl font-semibold tracking-tight text-stellar-text sm:text-2xl">
        {title}
      </h1>
      <p className="mt-stellar-2 text-sm text-stellar-text-muted">{description}</p>
      <div className="card-muted mt-stellar-6 p-stellar-6">
        <p className="text-sm text-stellar-text-subtle">This module will be implemented in a future sprint.</p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
