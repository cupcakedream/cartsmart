import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { neon } from './neon';
import { MealEditorView } from './components/MealEditorView';
import { IngredientsView } from './components/IngredientsView';
import { MealsView } from './components/MealsView';
import { MealPlansView } from './components/MealPlansView';
import { PlanShoppingView } from './components/PlanShoppingView';
import { ShoppingListEditorView } from './components/ShoppingListEditorView';
import { ShoppingListView } from './components/ShoppingListView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { DayPlanEditorView } from './components/DayPlanEditorView';
import { AppFooter } from './components/AppFooter';
import { AppNav } from './components/AppNav';
import { useGrocery } from './context/GroceryContext';
import { dayToSlug, slugToDay } from './utils/daySlug';

function MealsPage() {
  const navigate = useNavigate();

  return <MealsView onEditMeal={(mealId) => navigate(`/meals/${mealId}`)} />;
}

function MealEditorPage() {
  const navigate = useNavigate();
  const { mealId } = useParams<{ mealId: string }>();

  if (!mealId) {
    return <Navigate to="/meals" replace />;
  }

  return (
    <MealEditorView
      mealId={mealId === 'new' ? null : mealId}
      onBack={() => navigate(-1)}
    />
  );
}

function ShoppingPage() {
  return <ShoppingListView />;
}

function ShoppingListsPage() {
  const navigate = useNavigate();

  return (
    <PlanShoppingView onEditList={(listId) => navigate(`/shopping/lists/${listId}`)} />
  );
}

function ShoppingListEditorPage() {
  const { listId } = useParams<{ listId: string }>();

  if (!listId) {
    return <Navigate to="/shopping/lists" replace />;
  }

  return <ShoppingListEditorView listId={listId} />;
}

function WeeklyPlanPage() {
  const navigate = useNavigate();
  return <WeeklyPlanView onEditDay={(day) => navigate(`/plan/${dayToSlug(day)}`)} />;
}

function MealPlansPage() {
  const navigate = useNavigate();
  return <MealPlansView onEditPlan={(planId) => navigate(`/plan/plans/${planId}`)} />;
}

function MealPlanEditorPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();

  if (!planId) {
    return <Navigate to="/plan/plans" replace />;
  }

  return (
    <WeeklyPlanView
      planId={planId}
      onEditDay={(day) => navigate(`/plan/plans/${planId}/${dayToSlug(day)}`)}
    />
  );
}

function MealPlanDayEditorPage() {
  const navigate = useNavigate();
  const { planId, daySlug } = useParams<{ planId: string; daySlug: string }>();
  const day = daySlug ? slugToDay(daySlug) : null;

  if (!planId || !day) {
    return <Navigate to="/plan/plans" replace />;
  }

  return <DayPlanEditorView planId={planId} day={day} onBack={() => navigate(-1)} />;
}

function DayPlanEditorPage() {
  const navigate = useNavigate();
  const { daySlug } = useParams<{ daySlug: string }>();
  const day = daySlug ? slugToDay(daySlug) : null;

  if (!day) {
    return <Navigate to="/plan" replace />;
  }

  return <DayPlanEditorView day={day} onBack={() => navigate(-1)} />;
}

function UserMenu() {
  const session = neon.auth.useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = session.data?.user?.name ?? session.data?.user?.email ?? 'Account';

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleSignOut() {
    await neon.auth.signOut();
    setOpen(false);
  }

  return (
    <div className="app-user" ref={ref}>
      <button className="app-user-btn" onClick={() => setOpen((o) => !o)}>
        <svg className="app-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <div className="app-user-text">
          <span className="app-user-greeting">Welcome back,</span>
          <span className="app-user-name">
            {name}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      </button>
      {open && (
        <div className="app-user-dropdown">
          <div className="app-user-dropdown-email">{session.data?.user?.email}</div>
          <button className="app-user-signout" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const PAGE_TRANSITION_MS = 100;

export function AppRoutes() {
  const { loading } = useGrocery();
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }

    setVisible(false);
    const timeoutId = window.setTimeout(() => {
      setDisplayLocation(location);
      setVisible(true);
    }, PAGE_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [location, displayLocation.pathname]);

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <img src="/logo.png" alt="CartSmart" className="app-logo-icon" />
            <span className="app-logo-text">CartSmart</span>
          </div>

          <AppNav pathname={location.pathname} />

          <UserMenu />
        </div>
      </header>

      <div className="app">
        <main className="app-main">
          <div className={`page-transition ${visible ? 'is-visible' : 'is-hidden'}`}>
            <Routes location={displayLocation}>
              <Route path="/" element={<Navigate to="/meals" replace />} />
              <Route path="/items" element={<IngredientsView />} />
              <Route path="/meals" element={<MealsPage />} />
              <Route path="/meals/:mealId" element={<MealEditorPage />} />
              <Route path="/shopping" element={<ShoppingPage />} />
              <Route path="/shopping/lists" element={<ShoppingListsPage />} />
              <Route path="/shopping/lists/:listId" element={<ShoppingListEditorPage />} />
              <Route path="/plan" element={<WeeklyPlanPage />} />
              <Route path="/plan/plans" element={<MealPlansPage />} />
              <Route path="/plan/plans/:planId" element={<MealPlanEditorPage />} />
              <Route path="/plan/plans/:planId/:daySlug" element={<MealPlanDayEditorPage />} />
              <Route path="/plan/:daySlug" element={<DayPlanEditorPage />} />
              <Route path="*" element={<Navigate to="/meals" replace />} />
            </Routes>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
