import React, { useRef, KeyboardEvent } from 'react';
import { Input } from './input';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (/^\d*$/.test(digit)) {
      const newValue = value.split('');
      newValue[index] = digit;
      onChange(newValue.join(''));
      
      // Move to next input if digit entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d*$/.test(pastedData)) {
      onChange(pastedData.padEnd(length, ''));
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }, (_, i) => (
        <Input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl p-0"
        />
      ))}
    </div>
  );
}