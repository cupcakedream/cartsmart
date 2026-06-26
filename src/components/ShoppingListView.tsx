import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { groupIngredientsByDepartment } from '../utils/groupByDepartment';
import { DeleteBtn } from './IconBtn';

export function ShoppingListView() {
  const {
    getMostRecentShoppingList,
    getIngredientById,
    removeIngredientFromShoppingList,
    toggleShoppingListItemChecked,
  } = useGrocery();
  const { confirm } = useConfirm();

  const list = getMostRecentShoppingList();

  async function handleRemove(ingredientId: string, ingredientName: string) {
    if (!list) return;

    const confirmed = await confirm({
      title: 'Remove from list?',
      message: `Remove "${ingredientName}" from your shopping list?`,
      confirmLabel: 'Remove',
    });
    if (confirmed) await removeIngredientFromShoppingList(list.id, ingredientId);
  }

  if (!list) {
    return (
      <section className="view">
        <ViewHeader
          title="Shopping List"
          subtitle="Add meals or individual foods and check off items as you go."
        />
        <p className="empty-state">Your list will appear here once you create a plan.</p>
      </section>
    );
  }

  const listIngredients = list.ingredientIds
    .map((id) => getIngredientById(id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  const groups = groupIngredientsByDepartment(listIngredients);

  return (
    <section className="view">
      <ViewHeader
        title={list.name}
          subtitle="Add meals or individual foods and check off items as you go."
      />

      {groups.length === 0 ? (
        <p className="empty-state">This list is empty. Create a plan to add items.</p>
      ) : (
        <div className="department-groups">
          {groups.map((group) => (
            <section key={group.department} className="department-group card">
              <h3 className="department-heading">{group.department}</h3>
              <ul className="item-list">
                {group.ingredients.map((ingredient) => {
                  const isChecked = list.checkedIngredientIds.includes(ingredient.id);

                  return (
                    <li key={ingredient.id} className="item-row shopping-item-row">
                      <label className="shopping-item-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            void toggleShoppingListItemChecked(list.id, ingredient.id)
                          }
                        />
                        <span className={isChecked ? 'shopping-item-checked' : undefined}>
                          {ingredient.name}
                        </span>
                      </label>
                      <DeleteBtn onClick={() => void handleRemove(ingredient.id, ingredient.name)} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
