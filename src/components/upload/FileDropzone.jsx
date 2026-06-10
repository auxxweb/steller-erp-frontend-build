import { useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import Button from '../ui/Button.jsx';

function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  label = 'Drop files here or click to browse',
  hint,
  onFilesSelected,
  className = '',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    if (!fileList?.length || disabled) return;
    onFilesSelected?.(multiple ? Array.from(fileList) : fileList[0]);
  };

  return (
    <div
      className={cn(
        'relative rounded-stellar-xl border-2 border-dashed border-stellar-border bg-stellar-surface-muted/50 p-stellar-6 text-center transition-stellar',
        dragOver && 'border-stellar-accent bg-stellar-surface-muted',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-sm font-medium text-stellar-text">{label}</p>
      {hint && <p className="mt-stellar-1 text-xs text-stellar-text-muted">{hint}</p>}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-stellar-4"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}

export default FileDropzone;
