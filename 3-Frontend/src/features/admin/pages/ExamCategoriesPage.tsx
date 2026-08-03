import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../design-system/components/Button/Button';
import { Input } from '../../../design-system/components/Input/Input';
import { Spinner } from '../../../shared/components/Spinner';
import {
  useExamCategoriesAdmin, useCreateExamCategory,
  useUpdateExamCategory, useDeleteExamCategory,
} from '../hooks/useAdmin';
import type { ExamCategory } from '../types/admin.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
type FormData = z.infer<typeof schema>;

export default function ExamCategoriesPage() {
  const { data: categories = [], isLoading } = useExamCategoriesAdmin();
  const { mutate: create, isPending: creating } = useCreateExamCategory();
  const { mutate: update, isPending: updating } = useUpdateExamCategory();
  const { mutate: remove } = useDeleteExamCategory();
  const [editing, setEditing] = useState<ExamCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { sortOrder: 0 },
  });

  const openCreate = () => { setEditing(null); reset({ sortOrder: 0 }); setShowForm(true); };
  const openEdit = (c: ExamCategory) => { setEditing(c); reset({ name: c.name, sortOrder: c.sortOrder }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };

  const onSubmit = (data: FormData) => {
    if (editing) {
      update({ ...data, id: editing.id }, { onSuccess: closeForm });
    } else {
      create(data, { onSuccess: closeForm });
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-title2)', fontWeight: 700, color: 'var(--color-ink)' }}>Exam Categories</h1>
        <Button onClick={openCreate} variant="primary">+ New Category</Button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--color-surface-pearl)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, border: '1px solid var(--color-hairline)' }}>
          <h2 style={{ fontSize: 'var(--text-headline)', fontWeight: 600, marginBottom: 16 }}>{editing ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Name *" error={errors.name?.message} {...register('name')} />
            <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register('sortOrder')} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <Button type="submit" disabled={creating || updating} style={{ flex: 1 }}>
                {creating || updating ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm} style={{ flex: 1 }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-hairline)', textAlign: 'left' }}>
              {['Name', 'Sort', 'Active', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-ink)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '10px 12px' }}>{c.sortOrder}</td>
                <td style={{ padding: '10px 12px' }}>{c.isActive ? '✓' : '✗'}</td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={() => openEdit(c)} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Edit</Button>
                  <Button variant="dark" onClick={() => { if (confirm(`Delete "${c.name}"?`)) remove(c.id); }} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
