import React, { FunctionComponent } from 'react';
import styles from '../styles/Container.module.scss';

const Container: FunctionComponent<{ gridArea?: string }> = ({
    gridArea,
    children,
}) => (
    <section className={styles.container} style={{ gridArea }}>
        {children}
    </section>
);

export default Container;
