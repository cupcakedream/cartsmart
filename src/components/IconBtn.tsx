interface IconBtnProps {
  onClick: () => void;
  title: string;
  variant?: 'secondary' | 'danger' | 'pin' | 'pin-active';
  disabled?: boolean;
}

function IconBtn({ onClick, title, variant = 'secondary', disabled, children }: IconBtnProps & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--${variant}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <IconBtn onClick={onClick} title="Edit" variant="secondary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </IconBtn>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <IconBtn onClick={onClick} title="Delete" variant="danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </IconBtn>
  );
}

export function PinBtn({ onClick, active }: { onClick: () => void; active?: boolean }) {
  return (
    <IconBtn
      onClick={onClick}
      title={active ? 'Current' : 'Set as current'}
      variant={active ? 'pin-active' : 'pin'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
      </svg>
    </IconBtn>
  );
}
