import React from 'react';
import styles from '../styles/LoadingAnimation.module.scss';

const LoadingAnimation = () => (
    <div className={styles.container}>
        {(() => {
            const dots = [];

            for (let i = 0; i < 360; i += 30)
                dots.push(
                    <div className={styles.dot}
                         style={{transform: `translateX(-50%) rotate(${i}deg)`}}
                         key={i}
                    >
                        <div style={{animationDelay: `${i / 300}s`}}/>
                    </div>
                );

            return dots;
        })()}
    </div>
);

export default LoadingAnimation;
