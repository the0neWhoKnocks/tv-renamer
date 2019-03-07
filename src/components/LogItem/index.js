import React, { Fragment } from 'react';
import { number, string } from 'prop-types';
import styles, { ROOT_CLASS } from './styles';

const LogItem = ({
  deleted,
  error,
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
          {deleted && (
            <div className={`${ ROOT_CLASS }__deleted`}>
              <span className={`${ ROOT_CLASS }__deleted-icon`}>&times;</span>
              {deleted}
            </div>
          )}
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
  deleted: string,
  error: string,
  time: number,
  to: string,
};

export default LogItem;