import React from 'react';
import styles from '../styles/LoadingAnimation.module.scss';

const LoadingAnimation = () => {
    return (
        <div className={styles.container}>
            <div className={styles.dot} />
            <div className={styles.dot} style={{ animationDelay: '0.1s' }} />
            <div className={styles.dot} style={{ animationDelay: '0.2s' }} />
            <div className={styles.dot} style={{ animationDelay: '0.3s' }} />
            <div className={styles.dot} style={{ animationDelay: '0.4s' }} />
        </div>
    );
};

export default LoadingAnimation;
