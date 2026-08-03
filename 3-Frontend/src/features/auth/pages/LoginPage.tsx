import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../design-system/components/Input/Input';
import { Button } from '../../../design-system/components/Button/Button';
import { useLogin } from '../hooks/useLogin';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay';
import styles from './LoginPage.module.css';

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => login(data);

  const apiError = (error as { response?: { data?: { description?: string } } })
    ?.response?.data?.description;

  return (
    <div className={styles.page}>
      {isPending && <LoadingOverlay />}
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Vita<span style={{ color: '#34d399' }}>Log</span></h1>
          <p className={styles.subtitle}>{t('login.subtitle')}</p>
        </div>

        {apiError && (
          <div className={styles.errorBanner} role="alert">
            {apiError}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label={t('login.usernameOrEmail')}
            type="text"
            autoComplete="username"
            error={errors.usernameOrEmail?.message}
            {...register('usernameOrEmail')}
          />
          <Input
            label={t('login.password')}
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className={styles.actions}>
            <Button type="submit" disabled={isPending} style={{ width: '100%' }}>
              {isPending ? t('login.signingIn') : t('login.signIn')}
            </Button>
          </div>
        </form>

        <p className={styles.register}>
          {t('login.noAccount')}{' '}
          <Link to="/register">{t('login.createOne')}</Link>
        </p>
      </div>
    </div>
  );
}
