import { useState, type FormEvent } from 'react';
import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { DEFAULT_DEPARTMENT } from '../constants/departments';
import type { Ingredient } from '../types';
import { DepartmentSelect } from './DepartmentSelect';
import { EditBtn, DeleteBtn } from './IconBtn';

export function IngredientsView() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useGrocery();
  const { confirm } = useConfirm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDepartment, setAddDepartment] = useState(DEFAULT_DEPARTMENT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState(DEFAULT_DEPARTMENT);

  function startEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setEditName(ingredient.name);
    setEditDepartment(ingredient.department);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDepartment(DEFAULT_DEPARTMENT);
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!addName.trim()) return;

    await addIngredient(addName, addDepartment);
    setAddName('');
    setAddDepartment(DEFAULT_DEPARTMENT);
    setShowAddForm(false);
  }

  async function handleEdit(event: FormEvent, ingredient: Ingredient) {
    event.preventDefault();
    if (!editName.trim()) return;

    await updateIngredient({
      ...ingredient,
      name: editName.trim(),
      department: editDepartment,
    });
    cancelEdit();
  }

  async function handleRemove(ingredient: Ingredient) {
    const confirmed = await confirm({
      title: 'Remove item?',
      message: `Remove "${ingredient.name}" from your items? This will also remove it from meals and shopping lists.`,
      confirmLabel: 'Remove',
    });
    if (!confirmed) return;

    if (editingId === ingredient.id) {
      cancelEdit();
    }
    await deleteIngredient(ingredient.id);
  }

  return (
    <section className="view">
      <ViewHeader
        title="Foods"
        subtitle="Add your foods and assign a department to keep shopping organized."
        onAddFood={() => setShowAddForm((v) => !v)}
      />

      {showAddForm && (
        <form className="card form-card" onSubmit={handleAdd}>
          <h3>Add food</h3>
          <div className="add-food-form">
            <input
              type="text"
              className="field-control add-food-input"
              value={addName}
              onChange={(event) => setAddName(event.target.value)}
              placeholder="Food name (e.g. tomatoes)"
              aria-label="Food name"
              autoFocus
            />
            <DepartmentSelect
              className="field-control add-food-select"
              value={addDepartment}
              onChange={setAddDepartment}
            />
            <button type="submit" className="field-control add-food-submit">
              Add
            </button>
          </div>
        </form>
      )}

      {ingredients.length === 0 ? (
        <p className="empty-state">No items yet. Add your first one above.</p>
      ) : (
        <ul className="item-list">
          {ingredients.map((ingredient) =>
            editingId === ingredient.id ? (
              <li key={ingredient.id} className="item-row item-row-edit">
                <form
                  className="item-edit-form"
                  onSubmit={(event) => void handleEdit(event, ingredient)}
                >
                  <input
                    type="text"
                    className="field-control"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    aria-label="Item name"
                  />
                  <DepartmentSelect
                    className="field-control"
                    value={editDepartment}
                    onChange={setEditDepartment}
                  />
                  <div className="item-row-actions">
                    <button type="submit" className="field-control">
                      Save
                    </button>
                    <button type="button" className="btn-secondary field-control" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={ingredient.id} className="item-row">
                <div className="item-row-main">
                  <span>{ingredient.name}</span>
                  <span className="department-badge">{ingredient.department}</span>
                </div>
                <div className="item-row-actions">
                  <EditBtn onClick={() => startEdit(ingredient)} />
                  <DeleteBtn onClick={() => void handleRemove(ingredient)} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
