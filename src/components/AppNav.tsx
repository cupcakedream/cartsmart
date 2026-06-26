import { NavLink } from 'react-router-dom';

const NAV = [
  {
    to: '/items',
    label: 'Foods',
    matchPrefix: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    to: '/meals',
    label: 'Meals',
    matchPrefix: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    to: '/shopping',
    label: 'Grocery List',
    matchPrefix: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M9 7h6M9 11h6M9 15h4" />
      </svg>
    ),
  },
  {
    to: '/plan',
    label: 'Meal Plan',
    matchPrefix: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
] as const;

function isNavActive(pathname: string, to: string, matchPrefix: boolean): boolean {
  if (matchPrefix) {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return pathname === to;
}

interface AppNavProps {
  pathname: string;
}

export function AppNav({ pathname }: AppNavProps) {
  return (
    <nav className="nav">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={isNavActive(pathname, item.to, item.matchPrefix) ? 'nav-btn active' : 'nav-btn'}
        >
          <span className="nav-btn-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
