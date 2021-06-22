import React from 'react';
import '../Styles/Button.css';
import { Link } from 'react-router-dom';

const STYLES = ['buttonPrimary', 'buttonOutline', 'btn--test'];

const SIZES = ['buttonM', 'buttonL'];

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize
}) => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0];

  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

  return (
    <Link to='/login' className='btn-mobile'>
      <button
        className={`button ${checkButtonStyle} ${checkButtonSize}`}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    </Link>
  );
};
