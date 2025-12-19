'use client';

import React from 'react';

interface BundleCardProps {
  bundle: {
    id: string;
    name: string;
    description: string | null;
    custom_price: number;
    services: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  };
  onSelect: (bundleId: string) => void;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, onSelect }) => {
  const individualTotal = bundle.services.reduce((sum, s) => sum + s.price, 0);
  const savings = individualTotal - bundle.custom_price;

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1rem',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: '#1976d2',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          BUNDLE
        </span>
      </div>

      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
        {bundle.name}
      </h3>

      {bundle.description && (
        <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
          {bundle.description}
        </p>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          Includes:
        </div>
        <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
          {bundle.services.map((service) => (
            <li key={service.id} style={{ marginBottom: '0.25rem', color: '#333' }}>
              {service.name}
              <span style={{ color: '#999', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                (${service.price})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
            ${bundle.custom_price}
          </div>
          {savings > 0 && (
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <span style={{ textDecoration: 'line-through' }}>
                ${individualTotal}
              </span>
              <span style={{ color: '#4caf50', fontWeight: 600, marginLeft: '0.5rem' }}>
                Save ${savings}!
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onSelect(bundle.id)}
        style={{
          width: '100%',
          padding: '12px 24px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#1565c0';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#1976d2';
        }}
      >
        Book This Bundle
      </button>
    </div>
  );
};
