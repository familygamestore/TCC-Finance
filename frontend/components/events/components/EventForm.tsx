'use client';

import { FormEvent } from 'react';
import { EventFormData } from '@/types/event';
import { EVENT_FORM_FIELDS } from '@/constants/eventConstants';
import FormField from './FormField';

interface EventFormProps {
  form: EventFormData;
  setForm: (form: EventFormData) => void;
  onSubmit: (form: EventFormData) => void;
  submitting: boolean;
}

export default function EventForm({ form, setForm, onSubmit, submitting }: EventFormProps) {
  function handleFieldChange(name: keyof EventFormData, value: string) {
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      {EVENT_FORM_FIELDS.map(field => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          required={field.required}
          value={form[field.name]}
          onChange={handleFieldChange}
        />
      ))}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Menyimpan...' : 'Buat event'}
      </button>
    </form>
  );
}
