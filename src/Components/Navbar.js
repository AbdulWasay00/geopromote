import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import '../Styles/Navbar.css';
import styles from '../Styles/login.module.css';
import { auth } from "../Database/FirebaseConfig";

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
      <nav className='Nav'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            GeoPromote
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/notifications'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Notifications
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/advertisements'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Advertisements
              </Link>
            </li>

            <li className='nav-item'>
              <Link
                to='/shops'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Shops
              </Link>
            </li>

            <li>
              <Link
                to='/login'
                className='nav-links-mobile'
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </li>
          </ul>
          {button && <Button buttonStyle='buttonOutline'>LOGIN</Button>}
          <button
            className={styles.LogoutBtn}
            onClick={() => auth.signOut().then(() => window.location.reload())}
          >
            LOGOUT
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
