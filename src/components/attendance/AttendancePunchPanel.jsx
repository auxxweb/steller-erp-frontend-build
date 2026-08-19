import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { fetchTodayPunchStatus, punchAttendance } from '../../services/attendanceService.js';
import { fetchWorkspaceSettings } from '../../services/settingsService.js';
import { uploadAttendancePhoto } from '../../services/uploadService.js';
import {
  PUNCH_ACTION,
  PUNCH_STATE,
  PUNCH_STATE_LABELS,
} from '../../utils/attendanceConstants.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';
import { distanceMeters, formatDistance } from '../../utils/geo.js';
import { isGeoPunchEnabled, pickGeoFence } from '../../utils/attendanceGeo.js';
import useGeolocation from '../../hooks/useGeolocation.js';
import PunchCameraModal from './PunchCameraModal.jsx';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const STATUS_TONE = {
  [PUNCH_STATE.OUT]: 'bg-stellar-surface-muted text-stellar-text-muted',
  [PUNCH_STATE.WORKING]: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  [PUNCH_STATE.ON_BREAK]: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  [PUNCH_STATE.DONE]: 'bg-blue-500/15 text-blue-800 dark:text-emerald-200',
};

const PHOTO_ACTIONS = new Set([PUNCH_ACTION.PUNCH_IN, PUNCH_ACTION.PUNCH_OUT]);

function mergeStatus(payload, geoFence) {
  if (!payload) return { geoFence };
  return { ...payload, geoFence };
}

async function loadGeoFence() {
  const [todayRes, settingsRes] = await Promise.allSettled([
    fetchTodayPunchStatus({ skipGlobalLoader: true }),
    fetchWorkspaceSettings(),
  ]);
  const today = todayRes.status === 'fulfilled' ? todayRes.value.data?.data : null;
  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value.data?.data : null;
  return {
    today,
    geoFence: pickGeoFence(today, settings?.attendance, settings),
  };
}

function AttendancePunchPanel() {
  const [status, setStatus] = useState(null);
  const [geoFence, setGeoFence] = useState({ geoFenceEnabled: false });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const geoEnabled = isGeoPunchEnabled(geoFence);

  const { status: geoStatus, coords, error: geoError, request } = useGeolocation({
    enabled: geoEnabled,
    watch: geoEnabled,
  });

  const loadStatus = useCallback(async ({ silent = false } = {}) => {
    try {
      const { today, geoFence: nextFence } = await loadGeoFence();
      setGeoFence(nextFence);
      setStatus(mergeStatus(today, nextFence));
    } catch (err) {
      if (!silent) {
        toast.error(getApiErrorMessage(err, 'Failed to load attendance status'));
      }
      setStatus(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const timer = setInterval(() => loadStatus({ silent: true }), 60_000);
    return () => clearInterval(timer);
  }, [loadStatus]);

  const distance = useMemo(() => {
    if (!geoEnabled || !coords || geoFence?.latitude == null || geoFence?.longitude == null) {
      return null;
    }
    return distanceMeters(
      coords.latitude,
      coords.longitude,
      geoFence.latitude,
      geoFence.longitude,
    );
  }, [geoEnabled, coords, geoFence]);

  const insidePerimeter =
    !geoEnabled ||
    (distance != null && distance <= Number(geoFence?.radiusMeters || 0));

  const submitPunch = async (action, extras = {}) => {
    setActing(action);
    try {
      const { data } = await punchAttendance(action, extras);
      const payload = data.data;
      setGeoFence((prev) => payload?.geoFence || prev);
      setStatus(mergeStatus(payload, payload?.geoFence || geoFence));
      const labels = {
        [PUNCH_ACTION.PUNCH_IN]: 'Punched in',
        [PUNCH_ACTION.START_BREAK]: 'Break started',
        [PUNCH_ACTION.END_BREAK]: 'Back to work',
        [PUNCH_ACTION.PUNCH_OUT]: 'Punched out — shift ended',
      };
      toast.success(labels[action] || 'Updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update attendance'));
    } finally {
      setActing(null);
      setPendingAction(null);
    }
  };

  const handlePunch = async (action) => {
    let liveFence = geoFence;
    try {
      const live = await loadGeoFence();
      liveFence = live.geoFence;
      setGeoFence(liveFence);
      if (live.today) setStatus(mergeStatus(live.today, liveFence));
    } catch {
      // keep last known fence
    }

    const liveEnabled = isGeoPunchEnabled(liveFence);
    if (!liveEnabled || !PHOTO_ACTIONS.has(action)) {
      await submitPunch(action);
      return;
    }

    if (geoStatus !== 'granted' || !coords) {
      toast.error('Allow location access, then punch in or out again');
      request();
      return;
    }

    const liveDistance = distanceMeters(
      coords.latitude,
      coords.longitude,
      liveFence.latitude,
      liveFence.longitude,
    );
    if (liveDistance > Number(liveFence.radiusMeters || 0)) {
      toast.error(
        `Move inside the shop perimeter (${formatDistance(liveDistance)} away; limit ${formatDistance(liveFence.radiusMeters)})`,
      );
      return;
    }

    setPendingAction(action);
  };

  const handlePhotoCaptured = async (file) => {
    const action = pendingAction;
    if (!action || !coords) return;
    setActing(action);
    try {
      const { data } = await uploadAttendancePhoto(file);
      const image = data?.data?.image;
      if (!image?.url) {
        throw new Error('Photo upload did not return a URL');
      }
      await submitPunch(action, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        photo: {
          url: image.url,
          publicId: image.publicId,
          thumbnailUrl: image.thumbnailUrl || image.url,
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save punch photo'));
      setActing(null);
    }
  };

  const punchState = status?.punchState || PUNCH_STATE.OUT;
  const locationReady = !geoEnabled || (geoStatus === 'granted' && insidePerimeter);

  const buttons = [
    {
      action: PUNCH_ACTION.PUNCH_IN,
      label: 'Punch in',
      variant: 'primary',
      enabled: punchState === PUNCH_STATE.OUT && locationReady,
    },
    {
      action: PUNCH_ACTION.START_BREAK,
      label: 'Take break',
      variant: 'secondary',
      enabled: punchState === PUNCH_STATE.WORKING,
    },
    {
      action: PUNCH_ACTION.END_BREAK,
      label: 'Back to work',
      variant: 'primary',
      enabled: punchState === PUNCH_STATE.ON_BREAK,
    },
    {
      action: PUNCH_ACTION.PUNCH_OUT,
      label: 'Punch out',
      variant: 'danger',
      enabled:
        (punchState === PUNCH_STATE.WORKING || punchState === PUNCH_STATE.ON_BREAK) &&
        locationReady,
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title>Today&apos;s attendance</Card.Title>
        <Card.Description>
          {geoEnabled
            ? 'Punch in and out only inside the shop perimeter, with a shop-background photo.'
            : 'Mark your work day with punch in, breaks, and punch out — not tied to app login.'}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {loading ? (
          <p className="text-sm text-stellar-text-muted">Loading attendance…</p>
        ) : (
          <div className="space-y-stellar-4">
            <div className="flex flex-wrap items-center gap-stellar-3">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  STATUS_TONE[punchState] || STATUS_TONE[PUNCH_STATE.OUT],
                )}
              >
                {PUNCH_STATE_LABELS[punchState] || punchState}
              </span>
              <div className="flex flex-wrap gap-stellar-4 text-sm text-stellar-text-muted">
                <span>
                  In <strong className="font-mono text-stellar-text">{formatTime(status?.checkInAt)}</strong>
                </span>
                <span>
                  Out{' '}
                  <strong className="font-mono text-stellar-text">{formatTime(status?.checkOutAt)}</strong>
                </span>
                <span>
                  Worked{' '}
                  <strong className="text-stellar-text">{formatDuration(status?.workMinutes)}</strong>
                </span>
                {(status?.breakMinutes > 0 || punchState === PUNCH_STATE.ON_BREAK) && (
                  <span>
                    Break{' '}
                    <strong className="text-stellar-text">{formatDuration(status?.breakMinutes)}</strong>
                  </span>
                )}
              </div>
            </div>

            {geoEnabled && (
              <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/40 p-stellar-3 text-sm">
                <p className="font-medium text-stellar-text">
                  {geoFence?.locationLabel || 'Shop location'} · within{' '}
                  {formatDistance(geoFence?.radiusMeters)}
                </p>
                {geoStatus !== 'granted' && (
                  <p className="mt-stellar-1 text-stellar-text-muted">
                    {geoError || 'Allow location access to activate punch in and punch out.'}
                  </p>
                )}
                {geoStatus === 'granted' && (
                  <p
                    className={cn(
                      'mt-stellar-1',
                      insidePerimeter ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300',
                    )}
                  >
                    {insidePerimeter
                      ? `You are inside the perimeter (${formatDistance(distance)} away).`
                      : `You are outside the perimeter (${formatDistance(distance)} away). Move closer to punch.`}
                  </p>
                )}
                {geoStatus !== 'granted' && (
                  <Button variant="secondary" size="sm" className="mt-stellar-2" onClick={request}>
                    Allow location
                  </Button>
                )}
              </div>
            )}

            <div className="grid gap-stellar-2 sm:grid-cols-2 lg:grid-cols-4">
              {buttons.map((btn) => (
                <Button
                  key={btn.action}
                  variant={btn.variant}
                  disabled={!btn.enabled || Boolean(acting)}
                  isLoading={acting === btn.action}
                  onClick={() => handlePunch(btn.action)}
                  className="w-full"
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {punchState === PUNCH_STATE.DONE && (
              <p className="text-sm text-stellar-text-muted">
                Your shift for today is complete. See full history on the Attendance page.
              </p>
            )}
          </div>
        )}
      </Card.Content>

      <PunchCameraModal
        open={Boolean(pendingAction)}
        title={pendingAction === PUNCH_ACTION.PUNCH_OUT ? 'Punch-out photo' : 'Punch-in photo'}
        onClose={() => !acting && setPendingAction(null)}
        onCapture={handlePhotoCaptured}
      />
    </Card>
  );
}

export default AttendancePunchPanel;
