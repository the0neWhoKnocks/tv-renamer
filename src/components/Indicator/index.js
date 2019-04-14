import React from 'react';
import { bool } from 'prop-types';
import styles, {
  MODIFIER__VISIBLE,
  ROOT_CLASS,
} from './styles';

const Indicator = ({ visible }) => {
  const rootModifier = (visible) ? MODIFIER__VISIBLE : '';
  
  return (
    <div className={`${ ROOT_CLASS }__wrapper ${ styles } ${ rootModifier }`}>
      <div className={`${ ROOT_CLASS }`}>
        <div className={`${ ROOT_CLASS }__dot`} />
      </div>
    </div>
  );
};

Indicator.propTypes = {
  visible: bool,
};

export default Indicator;