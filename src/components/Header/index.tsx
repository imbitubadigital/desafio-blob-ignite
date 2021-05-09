import Link from 'next/link';
import styles from './header.module.scss';

interface HeaderProps {
  type?: 'large' | 'small';
}

export default function Header({ type }: HeaderProps): JSX.Element {
  return (
    <header className={styles.header} data-type={type}>
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
