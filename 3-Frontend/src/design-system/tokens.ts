/** TypeScript mirror of tokens.css — use in dynamic styles or tests. */
export const colors = {
  primary:         'var(--color-primary)',
  primaryFocus:    'var(--color-primary-focus)',
  primaryOnDark:   'var(--color-primary-on-dark)',
  canvas:          'var(--color-canvas)',
  parchment:       'var(--color-canvas-parchment)',
  pearl:           'var(--color-surface-pearl)',
  tile1:           'var(--color-surface-tile-1)',
  tile2:           'var(--color-surface-tile-2)',
  tile3:           'var(--color-surface-tile-3)',
  black:           'var(--color-surface-black)',
  ink:             'var(--color-ink)',
  bodyOnDark:      'var(--color-body-on-dark)',
  bodyMuted:       'var(--color-body-muted)',
  inkMuted80:      'var(--color-ink-muted-80)',
  inkMuted48:      'var(--color-ink-muted-48)',
  hairline:        'var(--color-hairline)',
} as const;

export const spacing = {
  xxs: 'var(--space-xxs)',
  xs:  'var(--space-xs)',
  sm:  'var(--space-sm)',
  md:  'var(--space-md)',
  lg:  'var(--space-lg)',
  xl:  'var(--space-xl)',
  xxl: 'var(--space-xxl)',
  section: 'var(--space-section)',
} as const;

export const radius = {
  none: 'var(--radius-none)',
  xs:   'var(--radius-xs)',
  sm:   'var(--radius-sm)',
  md:   'var(--radius-md)',
  lg:   'var(--radius-lg)',
  pill: 'var(--radius-pill)',
  full: 'var(--radius-full)',
} as const;

export const breakpoints = {
  phone:     640,
  tablet:    834,
  desktopSm: 1068,
  desktop:   1440,
} as const;
