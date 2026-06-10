import Card from '../ui/Card.jsx';

/**
 * Register physical copies of a product master — each line is a unique serial number.
 */
function SerialUnitsField({ value, onChange, error, disabled = false }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Serial numbers</Card.Title>
        <Card.Description>
          One serial per physical item (e.g. Sony A7 IV body #1, #2, #3). Rentals, QR scans,
          transfers, and maintenance always track the individual serial.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="form-group">
          <label htmlFor="serialNumbers" className="form-label">
            Serial numbers (one per line)
          </label>
          <textarea
            id="serialNumbers"
            className={`input min-h-[8rem] font-mono text-sm ${error ? 'input-error' : ''}`}
            placeholder={'SN-SONY-A7IV-001\nSN-SONY-A7IV-002\nSN-SONY-A7IV-003'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          {error && <p className="form-error">{error}</p>}
          <p className="mt-stellar-2 text-xs text-stellar-text-muted">
            You can add more serials later from the product&apos;s Units page. Each unit gets a
            unique QR code automatically.
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}

export default SerialUnitsField;
