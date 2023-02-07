import * as React from "react";
import { useTheme } from 'next-themes';
import Link from "next/link";

import styles from "./styles.module.scss";
import { useState } from "react";
import { useEffect } from "react";

interface Props {
  title: string;
  href: string;
  children: React.ReactNode;
}

const Card = ({ title, href, children }: Props) => {
  const { resolvedTheme } = useTheme();
  const [ theme, setTheme ] = useState('');

  useEffect(() => {
    if (resolvedTheme !== undefined) {
      setTheme(` ${styles[resolvedTheme]}`);
    }
  }, [resolvedTheme]);

  return <div className={`${styles.wrapper}${theme}`}>
    <div className={`${styles.title} nx-text-primary-600`}>{title}</div>

    <div className={styles.content}>{children}</div>

    <Link className={`${styles.readMore} nx-text-primary-600`} href={href}>Discover more</Link>
  </div>;
};

export default Card;
