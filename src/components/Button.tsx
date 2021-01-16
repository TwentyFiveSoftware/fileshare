import React, { FunctionComponent } from 'react';
import styles from '../styles/Button.module.scss';

const Button: FunctionComponent<{
    onClick?: Function;
    small?: boolean,
}> = ({ onClick, small = false, children }) => (
    <div
        className={small ? styles.button__small : styles.button}
        onClick={onClick ? () => onClick() : undefined}
    >
        {children}
    </div>
);

export default Button;
