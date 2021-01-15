import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.scss';
import logo from '../assets/twentyfivesoftware-logo.jpg';

const Header = () => (
    <div className={styles.header}>
        <Link to={'/'} className={styles.logo}>
            <img src={logo} alt={''} />
        </Link>
    </div>
);

export default Header;
