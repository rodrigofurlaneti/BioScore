import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'hero' | 'pearl' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: false;
}

interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  asChild: true;
}

type Props = ButtonProps | AnchorProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  ({ variant = 'primary', className, children, ...rest }, ref) => {
    const cls = clsx(styles.btn, styles[variant], className);

    if ((rest as AnchorProps).asChild) {
      const { asChild: _, ...anchorRest } = rest as AnchorProps;
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...anchorRest}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={cls} {...(rest as ButtonProps)}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
