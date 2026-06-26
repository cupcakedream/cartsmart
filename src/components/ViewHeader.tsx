import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageActions } from './PageActions';

function needsBackLink(pathname: string): boolean {
  return (
    /^\/meals\/.+/.test(pathname) ||
    /^\/shopping\/lists/.test(pathname) ||
    /^\/plan\/.+/.test(pathname)
  );
}

function BackLink() {
  const navigate = useNavigate();
  return (
    <button className="view-back-link" type="button" onClick={() => navigate(-1)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </button>
  );
}

interface TopLink {
  label: string;
  onClick: () => void;
}

interface ViewHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  topLink?: TopLink;
  onAddFood?: () => void;
}

export function ViewHeader({ title, subtitle, topLink, onAddFood }: ViewHeaderProps) {
  const { pathname } = useLocation();
  const showBack = needsBackLink(pathname);

  return (
    <header className="view-header">
      {showBack ? <BackLink /> : null}
      {!showBack && topLink ? (
        <button className="view-back-link" type="button" onClick={topLink.onClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {topLink.label}
        </button>
      ) : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
      <PageActions pathname={pathname} callbacks={{ onAddFood }} />
    </header>
  );
}
