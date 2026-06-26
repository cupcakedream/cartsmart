import { useNavigate } from 'react-router-dom';
import { getTodayDayOfWeek } from '../constants/daysOfWeek';
import { useGrocery } from '../context/GroceryContext';
import { dayToSlug } from '../utils/daySlug';

interface PageActionLinkProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'link';
  icon?: React.ReactNode;
}

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

function PageActionLink({ label, onClick, variant = 'secondary', icon, hideArrow }: PageActionLinkProps & { hideArrow?: boolean }) {
  if (variant === 'link') {
    return (
      <button type="button" className="page-action-text-link" onClick={onClick}>
        {icon}
        {label}
        {!hideArrow && <ArrowRightIcon />}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`page-action-link${variant === 'primary' ? ' page-action-link--primary' : ''}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

export function PageActions({ pathname, callbacks }: { pathname: string; callbacks?: { onAddFood?: () => void } }) {
  const navigate = useNavigate();
  const { getMostRecentShoppingList, getCurrentMealPlan } = useGrocery();

  if (pathname === '/items') {
    return (
      <div className="page-actions">
        <PageActionLink label="Add Food" onClick={() => callbacks?.onAddFood?.()} variant="link" />
      </div>
    );
  }

  if (pathname === '/meals') {
    return (
      <div className="page-actions">
        <PageActionLink label="Add meal" onClick={() => navigate('/meals/new')} variant="link" />
      </div>
    );
  }

  if (pathname === '/shopping') {
    const list = getMostRecentShoppingList();

    return (
      <div className="page-actions">
        {list ? (
          <PageActionLink label="Edit This List" onClick={() => navigate(`/shopping/lists/${list.id}`)} variant="link" hideArrow />
        ) : null}
        <PageActionLink label="Manage All Lists" onClick={() => navigate('/shopping/lists')} variant="link" />
      </div>
    );
  }

  if (pathname === '/plan') {
    const plan = getCurrentMealPlan();
    return (
      <div className="page-actions">
        {plan ? (
          <PageActionLink label="Edit This Plan" onClick={() => navigate(`/plan/plans/${plan.id}/${dayToSlug(getTodayDayOfWeek())}`)} variant="link" hideArrow />
        ) : null}
        <PageActionLink label="Manage All Plans" onClick={() => navigate('/plan/plans')} variant="link" />
      </div>
    );
  }

  return null;
}
