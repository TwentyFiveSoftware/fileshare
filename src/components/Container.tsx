import React, { FunctionComponent } from 'react';
import styles from '../styles/Container.module.scss';

const Container: FunctionComponent<{ gridArea?: string, small?: boolean }> = ({
    gridArea,
    small = false,
    children,
}) => (
    <section className={small ? styles.container__small : styles.container} style={{ gridArea }}>
        {children}
    </section>
);

export default Container;
