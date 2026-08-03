import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { SubNav } from '../../../design-system/components/Nav/SubNav';
import { Input } from '../../../design-system/components/Input/Input';
import { Button } from '../../../design-system/components/Button/Button';
import { Spinner } from '../../../shared/components/Spinner';
import { useAllExams, useCreateExamRequest } from '../hooks/useExams';
import styles from './ExamsPage.module.css';

const schema = z.object({
  doctorName: z.string().min(2, 'Doctor name is required'),
  notes:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ExamRequestPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: exams = [], isLoading } = useAllExams();
  const { mutate: createRequest, isPending } = useCreateExamRequest();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleExam = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onSubmit = (data: FormData) => {
    if (selectedIds.size === 0) return;
    createRequest(
      { ...data, examIds: Array.from(selectedIds) },
      { onSuccess: () => navigate('/exams') }
    );
  };

  const grouped = exams.reduce<Record<string, typeof exams>>((acc, exam) => {
    const cat = exam.categoryName;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exam);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <SubNav
        category={t('nav.exams')}
        links={[{ label: t('examRequest.myRequests'), to: '/exams' }, { label: t('examRequest.newRequest'), to: '/exams/requests' }]}
      />

      <div className={styles.hero}>
        <h1 className={styles.title}>{t('examRequest.title')}</h1>
        <p className={styles.subtitle}>{t('examRequest.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.body}>
          <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{t('examRequest.doctorInfo')}</h2>
            <Input label={t('examRequest.doctorName')} error={errors.doctorName?.message} {...register('doctorName')} />
            <Input label={t('examRequest.notes')} {...register('notes')} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                {t('examRequest.selectExams')} <span style={{ color: 'var(--color-primary)' }}>({selectedIds.size})</span>
              </h2>
            </div>

            {isLoading ? (
              <Spinner />
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className={styles.requestCard} style={{ marginBottom: 'var(--space-lg)' }}>
                  <div className={styles.requestHeader}>
                    <p className={styles.requestDoctor}>{category}</p>
                  </div>
                  {items.map((exam) => (
                    <label key={exam.id} className={styles.examRow} style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(exam.id)}
                        onChange={() => toggleExam(exam.id)}
                        style={{ accentColor: 'var(--color-primary)', width: 18, height: 18, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <p className={styles.examName}>{exam.name}</p>
                        {exam.abbreviation && <p className={styles.examCategory}>{exam.abbreviation}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              ))
            )}
          </div>

          <div style={{ position: 'sticky', bottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
            <Button
              type="submit"
              disabled={isPending || selectedIds.size === 0}
              style={{ minWidth: 200 }}
            >
              {isPending ? t('examRequest.creating') : t('examRequest.createButton', { count: selectedIds.size })}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
