import React from 'react';
import { string } from 'prop-types';
import styles from './styles';

export const ICON__DELETE = 'ui-icon_delete';
export const ICON__FOLDER = 'ui-icon_folder';
export const ICON__LOGO = 'ui-icon_logo';
export const ICON__REFRESH = 'ui-icon_refresh';
export const ICON__THUMBNAIL = 'ui-icon_thumbnail';
export const ICON__TMDB = 'ui-icon_tmdb';

const SVG = ({ className, icon }) => {
  return (
    <svg className={`svg-icon ${ styles } ${ className }`}>
      <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={`#${ icon }`}></use>
    </svg>
  );
};

SVG.defaultProps = {
  className: '',
};
SVG.propTypes = {
  className: string,
  icon: string,
};

export default SVG;