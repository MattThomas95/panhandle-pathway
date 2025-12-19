'use client';

import React, { useState, useEffect } from 'react';
import { useInput, useDataProvider } from 'react-admin';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface ServiceSelectorProps {
  source: string;
  label?: string;
  validate?: any;
  defaultValue?: string[];
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  source,
  label = "Services",
  validate,
  defaultValue = [],
}) => {
  const {
    field,
    fieldState: { error },
  } = useInput({
    source,
    defaultValue,
    validate,
  });

  const dataProvider = useDataProvider();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [newServiceId, setNewServiceId] = useState<string>('');

  // Fetch available services
  useEffect(() => {
    dataProvider
      .getList('services', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
        filter: { is_active: true },
      })
      .then(({ data }: any) => {
        setAvailableServices(data);
      })
      .catch((error: any) => {
        console.error('Error fetching services:', error);
      });
  }, [dataProvider]);

  const handleAddService = () => {
    if (newServiceId && !field.value?.includes(newServiceId)) {
      const newValue = [...(field.value || []), newServiceId];
      field.onChange(newValue);
      setNewServiceId('');
    }
  };

  const handleRemoveService = (serviceId: string) => {
    const newValue = (field.value || []).filter((id: string) => id !== serviceId);
    field.onChange(newValue);
  };

  const selectedServices = availableServices.filter((s) =>
    field.value?.includes(s.id)
  );

  const availableToAdd = availableServices.filter(
    (s) => !field.value?.includes(s.id)
  );

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 400,
          color: 'rgba(0, 0, 0, 0.6)',
          marginBottom: '0.5rem',
        }}
      >
        {label} {validate && <span style={{ color: '#d32f2f' }}>*</span>}
      </label>

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

      {/* Selected services */}
      {selectedServices.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {selectedServices.map((service) => (
            <div
              key={service.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                margin: '4px',
                background: '#e3f2fd',
                borderRadius: '16px',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ marginRight: '8px' }}>{service.name}</span>
              <span style={{ color: '#666', fontSize: '0.75rem', marginRight: '8px' }}>
                ${service.price}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveService(service.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '1rem',
                  lineHeight: '1',
                }}
                title="Remove service"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new service */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <select
          value={newServiceId}
          onChange={(e) => setNewServiceId(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
          disabled={availableToAdd.length === 0}
        >
          <option value="">
            {availableToAdd.length === 0
              ? 'No more services available'
              : 'Select a service to add...'}
          </option>
          {availableToAdd.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} (${service.price})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddService}
          disabled={!newServiceId}
          style={{
            padding: '8px 16px',
            background: newServiceId ? '#1976d2' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: newServiceId ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          + Add
        </button>
      </div>

      {(!field.value || field.value.length < 2) && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '0.5rem',
          }}
        >
          Select at least 2 services to create a bundle
        </div>
      )}
    </div>
  );
};
