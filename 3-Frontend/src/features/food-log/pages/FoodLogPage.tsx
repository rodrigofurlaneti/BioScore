import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { SubNav } from '../../../design-system/components/Nav/SubNav';
import { Input } from '../../../design-system/components/Input/Input';
import { Button } from '../../../design-system/components/Button/Button';
import { Spinner } from '../../../shared/components/Spinner';
import { useTodayLog, useFoodItems, useAddLogItem, useAnalyzePhoto } from '../hooks/useFoodLog';
import type { FoodItem, PhotoAnalysisResult } from '../types/foodLog.types';
import styles from './FoodLogPage.module.css';

const schema = z.object({
  foodItemId: z.string().min(1, 'Select a food item'),
  quantity:   z.coerce.number().min(0.5).max(20),
  mealTime:   z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type InputMode = 'select' | 'photo' | 'upload';

const MEAL_TIMES = ['07:00', '10:00', '12:00', '15:00', '19:00', '21:00'];

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '12px 20px',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid rgba(0,0,0,0.08)',
  fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)',
  color: 'var(--color-ink)', height: '44px',
  background: 'var(--color-canvas)',
};

export default function FoodLogPage() {
  const [mode, setMode] = useState<InputMode>('select');
  const [search, setSearch] = useState('');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [photoMealTime, setPhotoMealTime] = useState('12:00');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();

  const { data: log, isLoading: logLoading } = useTodayLog();
  const { data: foodItems = [] } = useFoodItems(search || undefined);
  const { mutate: addItem, isPending: adding } = useAddLogItem();
  const { mutate: analyzePhoto, isPending: analyzing } = useAnalyzePhoto();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, mealTime: '12:00' },
  });

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Armazena o item selecionado independente da busca
  const handleFoodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = foodItems.find(fi => fi.id === id) ?? null;
    setSelectedFoodItem(found);
  };

  const onSubmit = (data: FormData) => {
    if (!selectedFoodItem) return;
    addItem(
      { foodItemId: data.foodItemId, quantity: data.quantity, pointsPerServing: selectedFoodItem.points, mealTime: data.mealTime },
      { onSuccess: () => { reset({ quantity: 1, mealTime: '12:00' }); setSelectedFoodItem(null); } }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalysis(null);
    setPhotoPreview(URL.createObjectURL(file));
    analyzePhoto(file, { onSuccess: setAnalysis });
  };

  // Calcula pontos pela porção estimada: (grams/100) * (kcal/100) * 24
  const calcPhotoPoints = (a: typeof analysis) => {
    if (!a) return 0;
    if (a.caloriesPer100g > 0)
      return Math.round((a.estimatedPortionGrams / 100) * (a.caloriesPer100g / 100) * 24);
    return a.matchedFoodItemPoints ?? 0;
  };

  const handlePhotoConfirm = () => {
    if (!analysis?.matchedFoodItemId) return;
    const points = calcPhotoPoints(analysis);
    addItem(
      {
        foodItemId: analysis.matchedFoodItemId,
        quantity: 1,
        pointsPerServing: points,
        mealTime: photoMealTime,
        notes: `Via photo · ${analysis.estimatedPortionGrams}g`,
      },
      {
        onSuccess: () => {
          setAnalysis(null);
          setPhotoPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  const resetPhoto = () => {
    setAnalysis(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  return (
    <div className={styles.page}>
      <SubNav category={t('nav.foodLog')} />

      <div className={styles.hero}>
        <h1 className={styles.title}>{t('foodLog.title')}</h1>
        <p className={styles.dateBar}>{today}</p>
        {log && (
          <div className={styles.pointsBadge}>
            <span className={styles.pointsNum}>{log.totalPoints}</span>
            <span className={styles.pointsDen}>/ 300 pts</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {/* ── Add item panel ─────────────────────────────── */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>{t('foodLog.addItem')}</p>

          {/* Mode toggle */}
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === 'select' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('select')}
            >
              {t('foodLog.modeSelect')}
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === 'photo' ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode('photo'); resetPhoto(); }}
            >
              {t('foodLog.modeCamera')}
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === 'upload' ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode('upload'); resetPhoto(); }}
            >
              {t('foodLog.modeGallery')}
            </button>
          </div>

          {/* ── UPLOAD mode (gallery / device file picker) ── */}
          {mode === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              {/* Pick area */}
              <div className={styles.photoUploadArea} onClick={() => uploadInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Food preview" className={styles.photoPreview} />
                ) : (
                  <>
                    <span className={styles.photoIcon}>🖼️</span>
                    <p className={styles.photoHint}>{t('foodLog.tapToGallery')}</p>
                    <p className={styles.photoCaption}>jpg · png · webp</p>
                  </>
                )}
              </div>

              {/* Analyzing */}
              {analyzing && (
                <div className={styles.analysisCard}>
                  <Spinner />
                  <p style={{ color: 'var(--color-ink-muted-48)', fontSize: 'var(--text-caption)', textAlign: 'center', marginTop: 8 }}>
                    {t('foodLog.analyzing')}
                  </p>
                </div>
              )}

              {/* Result — same card as photo mode */}
              {analysis && !analyzing && (
                <div className={styles.analysisCard}>
                  <div className={styles.analysisHeader}>
                    <span>{analysis.isConfident ? '✅' : '⚠️'}</span>
                    <p className={styles.analysisFood}>{analysis.identifiedFoodName}</p>
                  </div>
                  <p className={styles.analysisMeta}>
                    ~{analysis.estimatedPortionGrams}g
                    {analysis.caloriesPer100g > 0 && ` · ${analysis.caloriesPer100g} kcal/100g`}
                  </p>
                  {analysis.notes && <p className={styles.analysisNotes}>{analysis.notes}</p>}

                  {analysis.wasAutoCreated && (
                    <div className={styles.autoCreatedBadge}>
                      {t('foodLog.autoCreated')}
                    </div>
                  )}
                  {analysis.wasCatalogUpdated && (
                    <div className={styles.autoCreatedBadge}>
                      {t('foodLog.catalogUpdated')}
                    </div>
                  )}

                  <div className={styles.matchBadge}>
                    <span>{analysis.wasAutoCreated ? t('foodLog.created') : t('foodLog.found')}</span>
                    <strong>{analysis.matchedFoodItemName}</strong>
                    <span className={styles.matchPoints}>{calcPhotoPoints(analysis)}pts</span>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 4 }}>{t('foodLog.mealTime')}</label>
                    <select style={selectStyle} value={photoMealTime} onChange={e => setPhotoMealTime(e.target.value)}>
                      {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <Button style={{ width: '100%' }} disabled={adding} onClick={handlePhotoConfirm}>
                    {adding ? t('foodLog.adding') : t('foodLog.confirmAdd')}
                  </Button>

                  <button type="button" className={styles.retakeBtn} onClick={resetPhoto}>
                    {t('foodLog.chooseAnother')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SELECT mode ──────────────────────────────── */}
          {mode === 'select' && (
            <>
              <Input
                label={t('foodLog.searchFood')}
                placeholder={t('foodLog.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 4 }}>{t('foodLog.foodItem')}</label>
                  <select style={selectStyle} {...register('foodItemId')} onChange={(e) => { register('foodItemId').onChange(e); handleFoodSelect(e); }}>
                    <option value="">{t('foodLog.selectFood')}</option>
                    {foodItems.map(fi => (
                      <option key={fi.id} value={fi.id}>{fi.name} — {fi.points}pts{fi.servingSize ? ` (${fi.servingSize})` : ''}</option>
                    ))}
                  </select>
                  {errors.foodItemId && <p style={{ color: '#d70015', fontSize: 'var(--text-caption)', marginTop: 4 }}>{errors.foodItemId.message}</p>}
                </div>

                <Input label={t('foodLog.quantity')} type="number" min={0.5} max={20} step={0.5} error={errors.quantity?.message} {...register('quantity')} />

                <div>
                  <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 4 }}>{t('foodLog.mealTime')}</label>
                  <select style={selectStyle} {...register('mealTime')}>
                    {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <Button type="submit" disabled={adding} style={{ width: '100%' }}>
                  {adding ? t('foodLog.adding') : t('foodLog.addButton')}
                </Button>
              </form>
            </>
          )}

          {/* Always-mounted hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* ── PHOTO mode ───────────────────────────────── */}
          {mode === 'photo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              {/* Upload area */}
              <div className={styles.photoUploadArea} onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Food preview" className={styles.photoPreview} />
                ) : (
                  <>
                    <span className={styles.photoIcon}>📷</span>
                    <p className={styles.photoHint}>{t('foodLog.tapToPhoto')}</p>
                    <p className={styles.photoCaption}>jpg · png · webp</p>
                  </>
                )}
              </div>

              {/* Analyzing */}
              {analyzing && (
                <div className={styles.analysisCard}>
                  <Spinner />
                  <p style={{ color: 'var(--color-ink-muted-48)', fontSize: 'var(--text-caption)', textAlign: 'center', marginTop: 8 }}>
                    {t('foodLog.analyzing')}
                  </p>
                </div>
              )}

              {/* Result */}
              {analysis && !analyzing && (
                <div className={styles.analysisCard}>
                  <div className={styles.analysisHeader}>
                    <span>{analysis.isConfident ? '✅' : '⚠️'}</span>
                    <p className={styles.analysisFood}>{analysis.identifiedFoodName}</p>
                  </div>
                  <p className={styles.analysisMeta}>
                    ~{analysis.estimatedPortionGrams}g
                    {analysis.caloriesPer100g > 0 && ` · ${analysis.caloriesPer100g} kcal/100g`}
                  </p>
                  {analysis.notes && <p className={styles.analysisNotes}>{analysis.notes}</p>}

                  {analysis.wasAutoCreated && (
                    <div className={styles.autoCreatedBadge}>
                      {t('foodLog.autoCreated')}
                    </div>
                  )}
                  {analysis.wasCatalogUpdated && (
                    <div className={styles.autoCreatedBadge}>
                      {t('foodLog.catalogUpdated')}
                    </div>
                  )}

                  <div className={styles.matchBadge}>
                    <span>{analysis.wasAutoCreated ? t('foodLog.created') : t('foodLog.found')}</span>
                    <strong>{analysis.matchedFoodItemName}</strong>
                    <span className={styles.matchPoints}>{calcPhotoPoints(analysis)}pts</span>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 4 }}>{t('foodLog.mealTime')}</label>
                    <select style={selectStyle} value={photoMealTime} onChange={e => setPhotoMealTime(e.target.value)}>
                      {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <Button style={{ width: '100%' }} disabled={adding} onClick={handlePhotoConfirm}>
                    {adding ? t('foodLog.adding') : t('foodLog.confirmAdd')}
                  </Button>

                  <button type="button" className={styles.retakeBtn} onClick={resetPhoto}>
                    {t('foodLog.retakePhoto')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Today's items ──────────────────────────────── */}
        <div className={styles.list}>
          <div className={styles.listHeader}>{t('foodLog.todayItems', { count: log?.items.length ?? 0 })}</div>
          {logLoading ? <Spinner /> : !log || log.items.length === 0 ? (
            <p className={styles.emptyState}>{t('foodLog.noItems')}</p>
          ) : (
            log.items.map(item => (
              <div key={item.id} className={styles.listItem}>
                <div style={{ flex: 1 }}>
                  <p className={styles.itemName}>{item.foodItemName}</p>
                  <p className={styles.itemMeta}>×{item.quantity}{item.mealTime ? ` · ${item.mealTime}` : ''}</p>
                </div>
                <span className={styles.itemPoints}>{item.pointsComputed}pt</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
