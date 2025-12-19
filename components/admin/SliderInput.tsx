'use client';

import React from 'react';
import { useInput, InputHelperText } from 'react-admin';

interface SliderInputProps {
  source: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  helperText?: string;
  fullWidth?: boolean;
  suffix?: string;
  validate?: any;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  source,
  label,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 0,
  helperText,
  fullWidth = true,
  suffix = '',
  validate,
}) => {
  const {
    field,
    fieldState: { error },
  } = useInput({
    source,
    defaultValue,
    validate,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(Number(e.target.value));
  };

  return (
    <div style={{ marginBottom: '1rem', width: fullWidth ? '100%' : 'auto' }}>
      <label
        htmlFor={`slider-${source}`}
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 400,
          color: 'rgba(0, 0, 0, 0.6)',
          marginBottom: '0.25rem',
        }}
      >
        {label || source}
      </label>

      {helperText && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'rgba(0, 0, 0, 0.6)',
            marginBottom: '0.5rem',
          }}
        >
          {helperText}
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#d32f2f',
            marginBottom: '0.5rem',
          }}
        >
          {error.message}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input
          {...field}
          id={`slider-${source}`}
          type="range"
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
            background: `linear-gradient(to right, #1976d2 0%, #1976d2 ${((field.value - min) / (max - min)) * 100}%, #e0e0e0 ${((field.value - min) / (max - min)) * 100}%, #e0e0e0 100%)`,
          }}
        />

        <div
          style={{
            minWidth: '80px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: '#f5f5f5',
          }}
        >
          {field.value}{suffix}
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1976d2;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1976d2;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          background: #1565c0;
          transform: scale(1.1);
        }

        input[type="range"]::-moz-range-thumb:hover {
          background: #1565c0;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};
