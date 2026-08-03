import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../design-system/components/Input/Input';
import { Button } from '../../../design-system/components/Button/Button';
import { useRegister } from '../hooks/useRegister';
import styles from './LoginPage.module.css';

const schema = z.object({
  fullName:    z.string().min(2, 'Full name is required'),
  email:       z.string().email('Invalid email'),
  phoneNumber: z.string().min(8, 'Phone number is required'),
  username:    z.string().min(3, 'Min 3 characters')
                 .regex(/^[a-z0-9._]+$/, 'Only lowercase letters, digits, dots and underscores'),
  password:    z.string().min(8, 'Min 8 characters')
                 .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
                 .regex(/[0-9]/, 'Must contain at least one digit'),
  birthDate:   z.string().min(1, 'Birth date is required'),
  gender:      z.enum(['M', 'F', 'O'], { error: 'Gender is required' }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { mutate: register_, isPending, error } = useRegister();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const genderMap: Record<string, 0 | 1 | 2> = { F: 0, M: 1, O: 2 };

  const onSubmit = (data: FormData) =>
    register_({ ...data, gender: genderMap[data.gender] });

  type ApiErrorShape = {
    response?: {
      data?: {
        description?: string;
        errors?: Record<string, string[]>;
      };
    };
  };
  const errData = (error as ApiErrorShape)?.response?.data;
  const apiErrors: string[] = errData
    ? [
        ...(errData.description ? [errData.description] : []),
        ...Object.values(errData.errors ?? {}).flat(),
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 480 }}>
        <div className={styles.header}>
          <h1 className={styles.logo}>{t('register.title')}</h1>
          <p className={styles.subtitle}>{t('register.subtitle')}</p>
        </div>

        {apiErrors.length > 0 && (
          <div className={styles.errorBanner} role="alert">
            {apiErrors.map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input label={t('register.fullName')}    error={errors.fullName?.message}    {...register('fullName')} />
          <Input label={t('register.email')}       type="email" error={errors.email?.message} {...register('email')} />
          <Input label={t('register.phoneNumber')} type="tel"   error={errors.phoneNumber?.message} {...register('phoneNumber')} />
          <Input label={t('register.username')}    error={errors.username?.message}    {...register('username')} />
          <Input label={t('register.password')}    type="password" error={errors.password?.message} {...register('password')} />
          <Input label={t('register.birthDate')}   type="date"  error={errors.birthDate?.message}  {...register('birthDate')} />

          <div>
            <label style={{ fontSize: 'var(--text-caption-strong)', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.224px', display: 'block', marginBottom: 'var(--space-xxs)' }}>
              {t('register.gender')}
            </label>
            <select
              aria-label={t('register.gender')}
              style={{ width: '100%', padding: '12px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-ink)', height: '44px', background: 'var(--color-canvas)' }}
              {...register('gender')}
              aria-invalid={!!errors.gender}
            >
              <option value="">{t('register.genderSelect')}</option>
              <option value="F">{t('register.female')}</option>
              <option value="M">{t('register.male')}</option>
              <option value="O">{t('register.other')}</option>
            </select>
            {errors.gender && <p style={{ color: '#d70015', fontSize: 'var(--text-caption)', marginTop: 4 }}>{errors.gender.message}</p>}
          </div>

          <Button type="submit" disabled={isPending} style={{ width: '100%' }}>
            {isPending ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>

        <p className={styles.register}>
          {t('register.alreadyHave')} <Link to="/login">{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
