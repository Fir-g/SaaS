import { useEffect, useState } from "react";
import { getBlacklistedNumbers, postBlacklistedNumbers } from "@/services/groupServices";

interface ExclusionModalProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExclusionModal({ tenantId, isOpen, onClose }: ExclusionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const existing = await getBlacklistedNumbers(tenantId);
        setNumbers(existing || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load blacklisted numbers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, tenantId]);

  const addNumber = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!/^\d{12}$/.test(trimmed)) {
      setError("Enter number in 91XXXXXXXXXX format (12 digits)");
      return;
    }
    if (numbers.includes(trimmed)) return;
    setNumbers([...numbers, trimmed]);
    setInput("");
  };

  const removeNumber = (num: string) => setNumbers(numbers.filter((n) => n !== num));

  const handleSave = async () => {
    await postBlacklistedNumbers(tenantId, numbers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-[720px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-base font-semibold">Edit exclusion list</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="px-5 py-3 space-y-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Add phone number (91XXXXXXXXXX)"
            />
            <button onClick={addNumber} className="px-4 py-2 text-sm border rounded">Add</button>
          </div>
          <div className="border rounded max-h-[40vh] overflow-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading…</div>
            ) : numbers.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No blacklisted numbers</div>
            ) : (
              <ul className="divide-y">
                {numbers.map((num) => (
                  <li key={num} className="flex items-center justify-between p-3">
                    <span className="text-sm text-gray-800">+{num}</span>
                    <button onClick={() => removeNumber(num)} className="text-gray-600 hover:text-red-600" title="Remove">🗑️</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-gray-800 rounded">Save</button>
        </div>
      </div>
    </div>
  );
}


