import React, { Fragment } from 'react';
import { number, string } from 'prop-types';
import styles, { ROOT_CLASS } from './styles';

const LogItem = ({
  error,
  from,
  time,
  to,
}) => (
  <div className={`${ ROOT_CLASS } ${ styles }`}>
    <div className={`${ ROOT_CLASS }__time`}>
      {new Date(time).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
    </div>
    <div className={`${ ROOT_CLASS }__body`}>
      {!error && (
        <Fragment>
          <div className={`${ ROOT_CLASS }__from`}>{from}</div>
          <div className={`${ ROOT_CLASS }__to`}>{to}</div>
        </Fragment>
      )}
      {error && (
        <div className={`${ ROOT_CLASS }__error`}>{error}</div>
      )}
    </div>
  </div>
);

LogItem.propTypes = {
  error: string,
  from: string,
  time: number,
  to: string,
};

export default LogItem;