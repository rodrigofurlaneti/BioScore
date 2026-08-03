import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../design-system/components/Button/Button';
import { Input } from '../../../design-system/components/Input/Input';
import { Spinner } from '../../../shared/components/Spinner';
import {
  useFoodItemsAdmin, useCreateFoodItem,
  useUpdateFoodItem, useDeleteFoodItem, useFoodCategories,
} from '../hooks/useAdmin';
import type { FoodItem } from '../types/admin.types';

const schema = z.object({
  foodCategoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(150),
  servingSize: z.string().max(100).optional(),
  points: z.coerce.number().int().min(0),
  notes: z.string().max(300).optional(),
});
type FormData = z.infer<typeof schema>;

export default function FoodItemsPage() {
  const { data: items = [], isLoading } = useFoodItemsAdmin();
  const { data: categories = [] } = useFoodCategories();
  const { mutate: create, isPending: creating } = useCreateFoodItem();
  const { mutate: update, isPending: updating } = useUpdateFoodItem();
  const { mutate: remove } = useDeleteFoodItem();
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { points: 0 },
  });

  const openCreate = () => { setEditing(null); reset({ points: 0 }); setShowForm(true); };
  const openEdit = (item: FoodItem) => {
    setEditing(item);
    reset({ foodCategoryId: item.foodCategoryId, name: item.name, servingSize: item.servingSize, points: item.points, notes: item.notes });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };

  const onSubmit = (data: FormData) => {
    if (editing) {
      update({ ...data, id: editing.id }, { onSuccess: closeForm });
    } else {
      create(data, { onSuccess: closeForm });
    }
  };

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? '—';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-title2)', fontWeight: 700, color: 'var(--color-ink)' }}>Food Items</h1>
        <Button onClick={openCreate} variant="primary">+ New Item</Button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--color-surface-pearl)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, border: '1px solid var(--color-hairline)' }}>
          <h2 style={{ fontSize: 'var(--text-headline)', fontWeight: 600, marginBottom: 16 }}>{editing ? 'Edit Item' : 'New Item'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Category *</label>
              <select style={{ width: '100%', padding: '12px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(0,0,0,0.08)', fontSize: 'var(--text-body)', height: 44, background: 'var(--color-canvas)' }} {...register('foodCategoryId')}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.foodCategoryId && <p style={{ color: '#d70015', fontSize: 'var(--text-caption)', marginTop: 4 }}>{errors.foodCategoryId.message}</p>}
            </div>
            <Input label="Name *" error={errors.name?.message} {...register('name')} />
            <Input label="Serving Size" {...register('servingSize')} />
            <Input label="Points *" type="number" error={errors.points?.message} {...register('points')} />
            <Input label="Notes" {...register('notes')} />
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
              {['Name', 'Category', 'Serving Size', 'Points', 'Active', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-ink)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-body-muted)' }}>{catName(item.foodCategoryId)}</td>
                <td style={{ padding: '10px 12px' }}>{item.servingSize ?? '—'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.points}pts</td>
                <td style={{ padding: '10px 12px' }}>{item.isActive ? '✓' : '✗'}</td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={() => openEdit(item)} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Edit</Button>
                  <Button variant="dark" onClick={() => { if (confirm(`Delete "${item.name}"?`)) remove(item.id); }} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
