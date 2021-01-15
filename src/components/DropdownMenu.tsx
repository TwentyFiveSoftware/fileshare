import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/DropdownMenu.module.scss';

const DropdownMenu: FunctionComponent<{
    options: { label: string; value: number }[];
}> = ({ options }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    useEffect(() => {
        const pageClickEvent = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Element)
            )
                setActive(false);
        };

        if (active) window.addEventListener('click', pageClickEvent);

        return () => window.removeEventListener('click', pageClickEvent);
    }, [active]);

    return (
        <div className={styles.container} ref={dropdownRef}>
            <div
                className={styles.selected}
                onClick={() => setActive((a) => !a)}
            >
                <span>{options[selectedIndex].label}</span>
                <div className={styles.icon}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </div>
            </div>

            <div className={active ? styles.options : styles.options__hidden}>
                {options.map(({ label }, index) => (
                    <div
                        className={styles.option}
                        onClick={() => {
                            setSelectedIndex(index);
                            setActive(false);
                        }}
                        key={index}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DropdownMenu;
