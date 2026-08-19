import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function PunchCameraModal({ open, title, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraError, setCameraError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);
  const [starting, setStarting] = useState(false);

  const resetCapture = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setFile(null);
  };

  const startCamera = async () => {
    setCameraError('');
    setStarting(true);
    stopStream(streamRef.current);
    streamRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera access is required. Allow camera and try again.'
          : 'Could not open the camera. You can still take a photo with the button below.',
      );
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      stopStream(streamRef.current);
      streamRef.current = null;
      resetCapture();
      setCameraError('');
      return undefined;
    }
    startCamera();
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the dialog opens
  }, [open]);

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      setCameraError('Camera is not ready yet. Wait a moment, or use Take photo.');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Could not capture the photo. Try again.');
          return;
        }
        const nextFile = new File([blob], `punch-${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(nextFile);
        setPreviewUrl(URL.createObjectURL(blob));
        stopStream(streamRef.current);
        streamRef.current = null;
      },
      'image/jpeg',
      0.88,
    );
  };

  const handleFile = (event) => {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    stopStream(streamRef.current);
    streamRef.current = null;
  };

  const handleUsePhoto = () => {
    if (!file) return;
    onCapture(file);
  };

  const handleRetake = () => {
    resetCapture();
    startCamera();
  };

  return (
    <Modal
      open={open}
      title={title || 'Take punch photo'}
      onClose={onClose}
      className="max-w-md"
      scrollBody
    >
      <div className="space-y-stellar-4">
        <p className="text-sm text-stellar-text-muted">
          Capture a photo that clearly shows the shop in the background. This is stored with your
          attendance record.
        </p>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Punch preview"
            className="max-h-72 w-full rounded-stellar-lg object-cover"
          />
        ) : (
          <div className="overflow-hidden rounded-stellar-lg bg-black">
            <video
              ref={videoRef}
              className="max-h-72 w-full object-cover"
              playsInline
              muted
              autoPlay
            />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {cameraError && <p className="text-sm text-amber-700 dark:text-amber-300">{cameraError}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        <div className="flex flex-wrap gap-stellar-2">
          {previewUrl ? (
            <>
              <Button variant="secondary" onClick={handleRetake}>
                Retake
              </Button>
              <Button onClick={handleUsePhoto}>Use this photo</Button>
            </>
          ) : (
            <>
              <Button onClick={handleSnap} disabled={starting || Boolean(cameraError)}>
                {starting ? 'Starting camera…' : 'Capture'}
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Take photo
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PunchCameraModal;
