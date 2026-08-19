import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import useGeolocation from '../../hooks/useGeolocation.js';
import { fetchWorkspaceSettings } from '../../services/settingsService.js';
import { fetchTodayPunchStatus } from '../../services/attendanceService.js';
import { ROLES } from '../../utils/constants.js';
import { isGeoPunchEnabled, pickGeoFence } from '../../utils/attendanceGeo.js';

function LocationPermissionGate({ role }) {
  const staffRole = role === ROLES.EMPLOYEE || role === ROLES.BRANCH_ADMIN;
  const [geoRequired, setGeoRequired] = useState(false);
  const { status, request, supported } = useGeolocation({
    enabled: staffRole && geoRequired,
    watch: false,
  });

  useEffect(() => {
    if (!staffRole) return undefined;
    let cancelled = false;

    const check = async () => {
      try {
        const [settingsRes, todayRes] = await Promise.allSettled([
          fetchWorkspaceSettings(),
          fetchTodayPunchStatus({ skipGlobalLoader: true }),
        ]);
        const settings =
          settingsRes.status === 'fulfilled' ? settingsRes.value.data?.data : null;
        const today = todayRes.status === 'fulfilled' ? todayRes.value.data?.data : null;
        const fence = pickGeoFence(today, settings?.attendance, settings);
        if (!cancelled) setGeoRequired(isGeoPunchEnabled(fence));
      } catch {
        if (!cancelled) setGeoRequired(false);
      }
    };

    check();
    const timer = setInterval(check, 15_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [staffRole]);

  if (!staffRole || !geoRequired) return null;

  const blocked = status === 'denied' || status === 'unavailable' || status === 'error';
  const prompting = status === 'idle' || status === 'requesting';

  if (!blocked && !prompting) return null;
  if (status === 'granted') return null;

  return (
    <Modal open title="Location access required" onClose={() => {}} className="max-w-md">
      <div className="mt-stellar-3 space-y-stellar-4">
        <p className="text-sm text-stellar-text-muted">
          Photo-based punch in and punch out is enabled. Allow location so we can confirm you are
          inside the shop perimeter. This prompt stays until location is turned on.
        </p>
        {!supported && (
          <p className="text-sm text-red-600">This browser does not support location access.</p>
        )}
        {status === 'denied' && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Location is blocked. Allow location for this site in browser or device settings, then
            tap Try again.
          </p>
        )}
        <Button onClick={request} className="w-full">
          {status === 'requesting' ? 'Waiting for location…' : 'Allow location'}
        </Button>
      </div>
    </Modal>
  );
}

export default LocationPermissionGate;
