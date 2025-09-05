import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getBlacklistedNumbers, postBlacklistedNumbers } from "@/services/groupServices";
import { X, Plus, Trash2, Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface ExclusionModalProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExclusionModal({ tenantId, isOpen, onClose }: ExclusionModalProps) {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = await getClerkBearer();
        const existing = await getBlacklistedNumbers(tenantId, token);
        setNumbers(existing || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load blacklisted numbers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, tenantId, getClerkBearer]);

  const addNumbers = () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) return;

    // Split by comma and clean up each number
    const inputNumbers = trimmed
      .split(',')
      .map(num => num.trim())
      .filter(num => num.length > 0);

    const validNumbers: string[] = [];
    const duplicateNumbers: string[] = [];
    const invalidNumbers: string[] = [];

    inputNumbers.forEach(num => {
      // Validate phone number (should be 10 digits for Indian numbers)
      if (!/^\d{10}$/.test(num)) {
        invalidNumbers.push(num);
        return;
      }

      // Combine country code with number
      const fullNumber = countryCode + num;

      // Check for duplicates in existing numbers
      if (numbers.includes(fullNumber)) {
        duplicateNumbers.push(fullNumber);
        return;
      }

      // Check for duplicates in current input
      if (validNumbers.includes(fullNumber)) {
        duplicateNumbers.push(fullNumber);
        return;
      }

      validNumbers.push(fullNumber);
    });

    // Handle validation errors
    if (invalidNumbers.length > 0) {
      setError(`Invalid numbers (must be 10 digits): ${invalidNumbers.join(', ')}`);
      return;
    }

    if (duplicateNumbers.length > 0 && validNumbers.length === 0) {
      setError(`${duplicateNumbers.length === 1 ? 'Number' : 'Numbers'} already exist: ${duplicateNumbers.join(', ')}`);
      return;
    }

    // Add valid numbers
    if (validNumbers.length > 0) {
      setNumbers([...numbers, ...validNumbers]);
      setPhoneInput("");
      setError(""); // Clear any previous errors
      
      // Show info about duplicates if any valid numbers were added
      if (duplicateNumbers.length > 0) {
        setError(`Added ${validNumbers.length} number(s). Skipped duplicates: ${duplicateNumbers.join(', ')}`);
      }
    }
  };

  const removeNumber = (num: string) => setNumbers(numbers.filter((n) => n !== num));

  const handleSave = async () => {
    try {
      const token = await getClerkBearer();
      await postBlacklistedNumbers(tenantId, numbers, token);
      onClose();
    } catch (e) {
      setError("Failed to save blacklisted numbers");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNumbers();
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any non-digit characters except commas
    value = value.replace(/[^\d,]/g, '');
    
    // Auto-separate numbers when they exceed 10 digits
    const numbers = value.split(',');
    const processedNumbers = numbers.map(num => {
      const trimmed = num.trim();
      if (trimmed.length > 10) {
        // Split into groups of 10 digits
        const chunks = [];
        for (let i = 0; i < trimmed.length; i += 10) {
          chunks.push(trimmed.slice(i, i + 10));
        }
        return chunks.join(',');
      }
      return trimmed;
    });
    
    setPhoneInput(processedNumbers.join(','));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Exclusion List</h3>
              <p className="text-sm text-gray-500">Manage phone numbers to exclude from WhatsApp integration</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
          {/* Error/Success Messages */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              error.includes('Added') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {error.includes('Added') ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{error}</span>
            </div>
          )}

          {/* Add Numbers Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Phone Numbers
            </label>
            <div className="flex gap-2">
              {/* Country Code Input */}
              <div className="w-20">
                <input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-medium"
                  placeholder="+91"
                  disabled={loading}
                />
              </div>
              
              {/* Phone Number Input */}
              <div className="flex-1 relative">
                <input
                  value={phoneInput}
                  onChange={handlePhoneInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter 10-digit numbers separated by commas"
                  disabled={loading}
                />
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              <button 
                onClick={addNumbers} 
                disabled={!phoneInput.trim() || loading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter 10-digit numbers separated by commas (e.g., 9876543210, 9123456789)
            </p>
          </div>

          {/* Numbers List */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Excluded Numbers</h4>
              {numbers.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {numbers.length} number{numbers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading numbers...</span>
                  </div>
                </div>
              ) : numbers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Phone className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">No excluded numbers</p>
                  <p className="text-xs text-gray-400">Add phone numbers above to exclude them</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {numbers.map((num, index) => (
                    <div 
                      key={num} 
                      className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {num}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeNumber(num)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove number"
                        aria-label={`Remove ${num} from exclusion list`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}