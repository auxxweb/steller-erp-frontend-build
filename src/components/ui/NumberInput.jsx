import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn.js';

const stripLeadingZeros = (raw, allowDecimal) => {
  if (raw === '' || raw === '.') return raw;
  if (allowDecimal && raw.includes('.')) {
    const [intPart, frac = ''] = raw.split('.');
    const cleanedInt = intPart.replace(/^0+(\d)/, '$1') || (frac !== '' ? '0' : '');
    return `${cleanedInt}${frac !== '' ? `.${frac}` : ''}`;
  }
  return raw.replace(/^0+(\d)/, '$1');
};

const parseNumber = (raw, allowDecimal) => {
  if (raw === '' || raw === '.') return 0;
  const n = allowDecimal ? parseFloat(raw) : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
};

const formatBlurredDisplay = (num, min) => {
  if (num === 0 && (min == null || min === 0)) return '';
  return String(num);
};

/**
 * Numeric field — free typing, no stuck leading zero, empty when value is 0.
 */
function NumberInput({
  value,
  onChange,
  allowDecimal = true,
  min,
  max,
  className,
  disabled,
  id,
  name,
  placeholder,
  onBlur,
  onFocus,
  'aria-invalid': ariaInvalid,
  ...rest
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  useEffect(() => {
    if (focused) return;
    setText(formatBlurredDisplay(safeValue, min));
  }, [safeValue, focused, min]);

  const commit = (raw) => {
    let next = stripLeadingZeros(raw, allowDecimal);
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(next)) return;

    setText(next);

    if (next === '' || next === '.') {
      if (min != null && min > 0) return;
      onChange?.(0);
      return;
    }

    let num = parseNumber(next, allowDecimal);
    if (max != null && num > max) num = max;
    onChange?.(num);
  };

  const handleBlur = (e) => {
    setFocused(false);
    let num = text === '' || text === '.' ? 0 : parseNumber(text, allowDecimal);
    if (min != null && num < min) num = min;
    if (max != null && num > max) num = max;
    setText(formatBlurredDisplay(num, min));
    onChange?.(num);
    onBlur?.(e);
  };

  return (
    <input
      {...rest}
      id={id}
      name={name}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      autoComplete="off"
      disabled={disabled}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      className={cn('input', className)}
      value={text}
      onChange={(e) => commit(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        if (safeValue === 0) setText('');
        onFocus?.(e);
      }}
      onBlur={handleBlur}
    />
  );
}

export default NumberInput;
