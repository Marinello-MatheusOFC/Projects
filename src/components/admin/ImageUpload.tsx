import { useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { ResponsivePicture, type FallbackContext } from '@/components/media/ResponsivePicture';

interface ImageUploadProps {
  label: string;
  alt: string;
  currentUrl?: string;
  fallback?: FallbackContext;
  busy?: boolean;
  error?: string;
  onClearError?: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function ImageUpload({
  label,
  alt,
  currentUrl,
  fallback = 'animal',
  busy = false,
  error,
  onClearError,
  onUpload,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : '');
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await onUpload(file);
      setFile(null);
      setPreviewUrl('');
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      // erro exibido pelo pai via prop `error`
    }
  };

  const shownUrl = previewUrl || currentUrl || '';

  return (
    <div className="admin-form" style={{ marginTop: 'var(--space-6)' }}>
      <h3>{label}</h3>

      {error && <Alert type="error" message={error} onClose={onClearError} />}

      {shownUrl ? (
        <ResponsivePicture src={shownUrl} width={320} height={200} fallback={fallback} alt={alt} />
      ) : (
        <div
          className="image-fallback"
          role="img"
          aria-label={`${label} — nenhuma imagem enviada`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '2rem',
            maxWidth: 320,
          }}
        >
          <ImagePlus size={32} aria-hidden="true" strokeWidth={1.5} />
          <span>Nenhuma imagem enviada.</span>
        </div>
      )}

      <div className="form-field" style={{ marginTop: 'var(--space-4)' }}>
        <label className="form-label" htmlFor={`${label.replace(/\s+/g, '-').toLowerCase()}-file`}>
          Imagem
        </label>
        <input
          id={`${label.replace(/\s+/g, '-').toLowerCase()}-file`}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="form-input"
          onChange={handleSelect}
        />
      </div>

      <div className="admin-form-actions">
        <Button type="button" variant="outline" size="sm" loading={busy} disabled={!file} onClick={handleUpload}>
          <Upload size={16} aria-hidden="true" />
          Enviar imagem
        </Button>
      </div>
    </div>
  );
}
