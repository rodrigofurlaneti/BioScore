import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../design-system/components/Button/Button';
import { Input } from '../../../design-system/components/Input/Input';
import { Spinner } from '../../../shared/components/Spinner';
import { useMyExamRequests, useCreateExamRequest, useUpdateExamItem } from '../hooks/useExams';
import { useAllExams } from '../hooks/useExams';

const schema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required'),
  notes: z.string().optional(),
  examIds: z.array(z.string()).min(1, 'Select at least one exam'),
});
type FormData = z.infer<typeof schema>;

export default function ExamRequestsPage() {
  const { data: requests = [], isLoading } = useMyExamRequests();
  const { data: allExams = [] } = useAllExams();
  const { mutate: create, isPending: creating } = useCreateExamRequest();
  const { mutate: completeItem } = useUpdateExamItem();
  const [showForm, setShowForm] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { examIds: [] },
  });

  const toggleExam = (id: string) => {
    const next = selectedExams.includes(id)
      ? selectedExams.filter(x => x !== id)
      : [...selectedExams, id];
    setSelectedExams(next);
    setValue('examIds', next, { shouldValidate: true });
  };

  const closeForm = () => { setShowForm(false); setSelectedExams([]); reset(); };

  const onSubmit = (data: FormData) => {
    create(data, { onSuccess: closeForm });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-title2)', fontWeight: 700, color: 'var(--color-ink)' }}>Exam Requests</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">+ New Request</Button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--color-surface-pearl)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, border: '1px solid var(--color-hairline)' }}>
          <h2 style={{ fontSize: 'var(--text-headline)', fontWeight: 600, marginBottom: 16 }}>New Exam Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Doctor Name *" error={errors.doctorName?.message} {...register('doctorName')} />
            <Input label="Notes" {...register('notes')} />
            <div>
              <p style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, marginBottom: 8 }}>Select Exams *</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allExams.map(e => (
                  <button key={e.id} type="button" onClick={() => toggleExam(e.id)}
                    style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-hairline)', background: selectedExams.includes(e.id) ? 'var(--color-primary)' : 'var(--color-canvas)', color: selectedExams.includes(e.id) ? '#fff' : 'var(--color-ink)', cursor: 'pointer', fontSize: 'var(--text-caption)' }}>
                    {e.name}{e.abbreviation ? ` (${e.abbreviation})` : ''}
                  </button>
                ))}
              </div>
              {errors.examIds && <p style={{ color: '#d70015', fontSize: 'var(--text-caption)', marginTop: 4 }}>{errors.examIds.message}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" disabled={creating} style={{ flex: 1 }}>{creating ? 'Creating…' : 'Create Request'}</Button>
              <Button type="button" variant="secondary" onClick={closeForm} style={{ flex: 1 }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : requests.length === 0 ? (
        <p style={{ color: 'var(--color-body-muted)', textAlign: 'center', padding: 48 }}>No exam requests yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(req => (
            <div key={req.id} style={{ border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: 20, background: 'var(--color-canvas)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-headline)' }}>Dr. {req.doctorName}</p>
                  <p style={{ color: 'var(--color-body-muted)', fontSize: 'var(--text-caption)' }}>{new Date(req.requestDate).toLocaleDateString()}{req.notes ? ` · ${req.notes}` : ''}</p>
                </div>
                <span style={{ fontSize: 'var(--text-caption)', background: 'var(--color-surface-pearl)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                  {req.items.filter(i => i.isCompleted).length}/{req.items.length} completed
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {req.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-surface-pearl)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 'var(--text-body)' }}>{item.examName}{item.abbreviation ? ` (${item.abbreviation})` : ''}</p>
                      {item.isCompleted && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-body-muted)' }}>Done {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : ''}{item.laboratory ? ` · ${item.laboratory}` : ''}</p>}
                    </div>
                    {!item.isCompleted && (
                      <Button variant="secondary" onClick={() => completeItem({ requestId: req.id, itemId: item.id, data: { isCompleted: true, completedDate: new Date().toISOString().split('T')[0] } })} style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}>
                        Mark Done
                      </Button>
                    )}
                    {item.isCompleted && <span style={{ color: 'green', fontWeight: 600 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
