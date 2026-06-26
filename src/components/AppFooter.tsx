import { useRef, useState, type ChangeEvent } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { parseItemsCsv } from '../utils/parseItemsCsv';

export function AppFooter() {
  const { importIngredientsFromCsv } = useGrocery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setMessage(null);

    try {
      const text = await file.text();
      const items = parseItemsCsv(text);

      if (items.length === 0) {
        setMessage('No items found in that file.');
        return;
      }

      const { imported, skipped } = await importIngredientsFromCsv(items);

      if (imported === 0) {
        setMessage(`All ${skipped} items were already in your list.`);
        return;
      }

      const skippedNote = skipped > 0 ? ` ${skipped} skipped as duplicates.` : '';
      setMessage(`Imported ${imported} item${imported === 1 ? '' : 's'}.${skippedNote}`);
    } catch {
      setMessage('Could not read that file. Try a CSV with name and department columns.');
    }
  }

  return (
    <footer className="app-footer">
      <p className="app-footer-main">
        Built by MJ
        <span className="app-footer-separator" aria-hidden="true">
          ·
        </span>
        <button
          type="button"
          className="app-footer-link"
          onClick={() => fileInputRef.current?.click()}
        >
          Import from CSV
        </button>
      </p>
      {message ? <p className="app-footer-message">{message}</p> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="visually-hidden"
        aria-label="Import items from CSV file"
        onChange={(event) => void handleFileChange(event)}
      />
    </footer>
  );
}
