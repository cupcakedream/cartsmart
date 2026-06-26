import { useMemo, useState, type FormEvent } from 'react';
import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { EditBtn, DeleteBtn, PinBtn } from './IconBtn';
import type { ShoppingList } from '../types';

interface PlanShoppingViewProps {
  onEditList: (listId: string) => void;
}

function sortPlans(lists: ShoppingList[]): ShoppingList[] {
  return [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function PlanShoppingView({ onEditList }: PlanShoppingViewProps) {
  const {
    shoppingLists,
    addShoppingList,
    deleteShoppingList,
    currentShoppingListId,
    setCurrentShoppingList,
  } = useGrocery();
  const { confirm } = useConfirm();

  const [newListName, setNewListName] = useState('');

  const plans = useMemo(() => sortPlans(shoppingLists), [shoppingLists]);

  async function handleCreateList(event: FormEvent) {
    event.preventDefault();
    const list = await addShoppingList(newListName);
    setNewListName('');
    onEditList(list.id);
  }

  async function handleRemove(plan: ShoppingList) {
    const confirmed = await confirm({
      title: 'Remove list?',
      message: `Remove "${plan.name}" and all of its items?`,
      confirmLabel: 'Remove',
    });
    if (!confirmed) return;

    await deleteShoppingList(plan.id);
  }

  return (
    <section className="view">
      <ViewHeader
        title="Shopping Lists"
        subtitle="Create and manage your shopping lists."
      />

      <form className="field-row" onSubmit={handleCreateList}>
        <input
          type="text"
          className="field-control"
          value={newListName}
          onChange={(event) => setNewListName(event.target.value)}
          placeholder="New list name (optional)"
          aria-label="Shopping list name"
        />
        <button type="submit" className="field-control">
          Create list
        </button>
      </form>

      {plans.length === 0 ? (
        <p className="empty-state">No lists yet. Create one above to get started.</p>
      ) : (
        <ul className="item-list">
          {plans.map((plan) => {
            const isCurrent = currentShoppingListId === plan.id;
            return (
              <li key={plan.id} className="item-row plan-row">
                <div className="item-row-main">
                  <span className="plan-name-row">
                    {plan.name}
                  </span>
                  <span className="plan-meta">
                    {plan.ingredientIds.length}{' '}
                    {plan.ingredientIds.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="item-row-actions">
                  <PinBtn active={isCurrent} onClick={() => void setCurrentShoppingList(plan.id)} />
                  <EditBtn onClick={() => onEditList(plan.id)} />
                  <DeleteBtn onClick={() => void handleRemove(plan)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
