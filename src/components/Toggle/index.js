import React from 'react';
import { bool, func, node, shape, string } from 'prop-types';
import styles, {
  MODIFIER__CURRENT,
  ROOT_CLASS,
} from './styles';

const Toggle = ({
  children,
  childStyle,
  className,
  data,
  id,
  onToggle,
  style,
  title,
  toggled,
}) => {
  const dynamicProps = {
    onChange: onToggle,
  };
  let btnModifier = '';
  
  if(toggled) btnModifier += ` ${ MODIFIER__CURRENT }`;
  
  if(!onToggle) dynamicProps.defaultChecked = toggled;
  else dynamicProps.checked = toggled;

  return (
    <div className={`${ ROOT_CLASS } ${ styles } ${ className }`} style={style}>
      <input
        className={`${ ROOT_CLASS }__input`}
        type="checkbox"
        id={id}
        {...dynamicProps}
        {...data}
      />
      <label
        className={`${ ROOT_CLASS }__btn ${ btnModifier }`}
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