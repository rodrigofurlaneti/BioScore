import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../design-system/components/Button/Button';
import { Input } from '../../../design-system/components/Input/Input';
import { Spinner } from '../../../shared/components/Spinner';
import { useUsers, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import type { User } from '../types/users.types';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required').max(200),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const { mutate: update, isPending: updating } = useUpdateUser();
  const { mutate: remove } = useDeleteUser();
  const [editing, setEditing] = useState<User | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openEdit = (u: User) => {
    setEditing(u);
    reset({ fullName: u.fullName, phoneNumber: u.phoneNumber, birthDate: u.birthDate });
  };
  const closeEdit = () => { setEditing(null); reset(); };

  const onSubmit = (data: FormData) => {
    if (!editing) return;
    update({ ...data, id: editing.id }, { onSuccess: closeEdit });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 'var(--text-title2)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 24 }}>Users</h1>

      {editing && (
        <div style={{ background: 'var(--color-surface-pearl)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, border: '1px solid var(--color-hairline)' }}>
          <h2 style={{ fontSize: 'var(--text-headline)', fontWeight: 600, marginBottom: 4 }}>Edit User</h2>
          <p style={{ color: 'var(--color-body-muted)', fontSize: 'var(--text-caption)', marginBottom: 16 }}>{editing.username} · {editing.email}</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Full Name *" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Phone Number" {...register('phoneNumber')} />
            <Input label="Birth Date" type="date" {...register('birthDate')} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Button type="submit" disabled={updating} style={{ flex: 1 }}>{updating ? 'Saving…' : 'Save Changes'}</Button>
              <Button type="button" variant="secondary" onClick={closeEdit} style={{ flex: 1 }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-hairline)', textAlign: 'left' }}>
              {['Full Name', 'Username', 'Email', 'Gender', 'Active', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-ink)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.fullName}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-body-muted)' }}>{u.username}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-body-muted)' }}>{u.email}</td>
                <td style={{ padding: '10px 12px' }}>{u.gender}</td>
                <td style={{ padding: '10px 12px' }}>{u.isActive ? '✓' : '✗'}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-body-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={() => openEdit(u)} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Edit</Button>
                  <Button variant="dark" onClick={() => { if (confirm(`Delete user "${u.username}"?`)) remove(u.id); }} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
