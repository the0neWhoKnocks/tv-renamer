import React from 'react';
import { bool, node } from 'prop-types';
import Modal from 'COMPONENTS/Modal';
import styles, {
  ROOT_CLASS,
} from './styles';

const OverlayScreen = ({
  children,
  visible,
}) => (
  <Modal
    noMask
    rootClassOverride={ ROOT_CLASS }
    stylesOverride={styles}
    visible={visible}
  >
    <div className={`${ ROOT_CLASS }__alignment`}>
      {children}
    </div>
  </Modal>
);

OverlayScreen.propTypes = {
  children: node,
  visible: bool,
};

export default OverlayScreen;