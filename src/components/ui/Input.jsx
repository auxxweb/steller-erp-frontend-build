import { cn } from '../../utils/cn.js';
import NumberInput from './NumberInput.jsx';

function Input({
  label,
  hint,
  error,
  id,
  className = '',
  wrapperClassName = '',
  type,
  value,
  onChange,
  min,
  max,
  step,
  ...props
}) {
  const inputId = id || props.name;

  if (type === 'number') {
    const allowDecimal =
      step === undefined ||
      step === 'any' ||
      (typeof step === 'string' && String(step).includes('.')) ||
      (typeof step === 'number' && !Number.isInteger(step));

    const toNumber = () => {
      if (value === '' || value === undefined || value === null) return 0;
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const emitChange = (n) => {
      onChange?.({
        target: {
          value: n === 0 ? '' : String(n),
          name: props.name,
        },
      });
    };

    return (
      <div className={cn('form-group', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <NumberInput
          id={inputId}
          name={props.name}
          disabled={props.disabled}
          required={props.required}
          placeholder={props.placeholder}
          className={cn(error && 'input-error', className)}
          aria-invalid={Boolean(error)}
          value={toNumber()}
          min={min != null ? Number(min) : undefined}
          max={max != null ? Number(max) : undefined}
          allowDecimal={allowDecimal}
          onChange={emitChange}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="form-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('form-group', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={cn('input', error && 'input-error', className)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="form-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
