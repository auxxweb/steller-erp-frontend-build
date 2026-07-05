export const PUNCH_STATE = {
  OUT: 'out',
  WORKING: 'working',
  ON_BREAK: 'on_break',
  DONE: 'done',
};

export const PUNCH_ACTION = {
  PUNCH_IN: 'punch_in',
  START_BREAK: 'start_break',
  END_BREAK: 'end_break',
  PUNCH_OUT: 'punch_out',
};

export const PUNCH_STATE_LABELS = {
  [PUNCH_STATE.OUT]: 'Not punched in',
  [PUNCH_STATE.WORKING]: 'Working',
  [PUNCH_STATE.ON_BREAK]: 'On break',
  [PUNCH_STATE.DONE]: 'Shift ended',
};
