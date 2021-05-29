import React from 'react';
import { bool, func, node, shape, string } from 'prop-types';
import styles, {
  MODIFIER__DISABLED,
  ROOT_CLASS,
} from './styles';

const Toggle = ({
  children,
  childStyle,
  className,
  data,
  disabled,
  id,
  onToggle,
  style,
  title,
  toggled,
}) => {
  const dynamicProps = {
    onChange: onToggle,
  };
  let rootModifier = '';
  
  if (!onToggle) dynamicProps.defaultChecked = toggled;
  else dynamicProps.checked = toggled;
  
  if (disabled) rootModifier += MODIFIER__DISABLED;

  return (
    <div className={`${ ROOT_CLASS } ${ styles } ${ className } ${ rootModifier }`} style={style}>
      <input
        className={`${ ROOT_CLASS }__input`}
        disabled={disabled}
        type="checkbox"
        id={id}
        {...dynamicProps}
        {...data}
      />
      <label
        className={`${ ROOT_CLASS }__btn`}
        htmlFor={id}
        style={childStyle}
        title={title}
      >
        <div className={`${ ROOT_CLASS }__content-wrapper`}>
          {children}
        </div>
      </label>
    </div>
  );
};

Toggle.defaultProps = {
  className: '',
  toggled: false,
};
Toggle.propTypes = {
  children: node,
  // CSS styles that are applied to the label wrapping the children
  childStyle: shape({}),
  // A CSS class for the toggle
  className: string,
  // An Object containing `data-` attributes
  data: shape({}),
  // Whether or not it's disabled
  disabled: bool,
  // A unique ID for the toggle
  id: string.isRequired,
  // A handler for when it's toggled on or off
  onToggle: func,
  // CSS styles that are applied to the toggle
  style: shape({}),
  // A title for the label, so text is displayed on hover
  title: string,
  // Whether or not the toggle is active
  toggled: bool,
};

export default Toggle;