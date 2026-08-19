import { useCallback, useEffect, useRef, useState } from 'react';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 8000,
};

function readCoords(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

/**
 * Request and watch GPS. When `enabled`, keeps prompting until permission is granted.
 */
export default function useGeolocation({ enabled = true, watch = true } = {}) {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const request = useCallback(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setCoords(null);
      setError('Location is not supported in this browser');
      return;
    }

    setStatus((prev) => (prev === 'granted' ? prev : 'requesting'));
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(readCoords(position));
        setStatus('granted');
        setError(null);
      },
      (err) => {
        const denied = err.code === 1;
        setStatus(denied ? 'denied' : 'error');
        setCoords(null);
        setError(
          denied
            ? 'Location access is required for attendance punch'
            : err.message || 'Unable to read your location',
        );
      },
      GEO_OPTIONS,
    );
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      stopWatch();
      setStatus('idle');
      setCoords(null);
      setError(null);
      return undefined;
    }
    request();
    return undefined;
  }, [enabled, request, stopWatch]);

  useEffect(() => {
    if (!enabled || !watch || status !== 'granted' || !navigator.geolocation) {
      stopWatch();
      return undefined;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCoords(readCoords(position));
        setStatus('granted');
        setError(null);
      },
      () => {},
      GEO_OPTIONS,
    );

    return () => stopWatch();
  }, [enabled, watch, status, stopWatch]);

  useEffect(() => {
    if (!enabled || typeof navigator.permissions?.query !== 'function') return undefined;
    let permission = null;
    let cancelled = false;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return;
        permission = result;
        permission.onchange = () => {
          if (result.state === 'granted') request();
          if (result.state === 'denied') {
            setStatus('denied');
            setCoords(null);
            setError('Location access is required for attendance punch');
          }
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (permission) permission.onchange = null;
    };
  }, [enabled, request]);

  useEffect(() => {
    if (!enabled || (status !== 'denied' && status !== 'error')) return undefined;
    const timer = setInterval(() => request(), 12000);
    return () => clearInterval(timer);
  }, [enabled, status, request]);

  return { status, coords, error, request, supported: Boolean(navigator.geolocation) };
}
