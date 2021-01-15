import React, { FunctionComponent } from 'react';
import styles from '../styles/Button.module.scss';

const Button: FunctionComponent<{
    onClick?: Function;
}> = ({ onClick, children }) => (
    <div
        className={styles.button}
        onClick={onClick ? () => onClick() : undefined}
    >
        {children}
    </div>
);

export default Button;
