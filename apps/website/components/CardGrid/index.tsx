import * as React from "react";

import styles from "./styles.module.scss";

interface Props {
  children: React.ReactNode;
}

const CardGrid = ({ children }: Props) => {
  return <div className={styles.wrapper}>
    {children}
  </div>;
};

export default CardGrid;
