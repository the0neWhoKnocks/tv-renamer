import React from 'react';
import { arrayOf, number, string } from 'prop-types';
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
      {(!error && to) && (
        <div className={`${ ROOT_CLASS }__to`}>{to}</div>
      )}
      {(!error && deleted) && (
        deleted.map((deletedPath, ndx) => (
          <div key={`${ time }_${ ndx }`} className={`${ ROOT_CLASS }__deleted`}>
            <span className={`${ ROOT_CLASS }__deleted-icon`}>&#x2713;</span>
            Deleted folder: <span className={`${ ROOT_CLASS }__deleted-path`}>&quot;{deletedPath}&quot;</span>
          </div>
        ))
      )}
      {error && (
        <div className={`${ ROOT_CLASS }__error`}>{error}</div>
      )}
    </div>
  </div>
);

LogItem.propTypes = {
  deleted: arrayOf(string),
  error: string,
  time: number,
  to: string,
};

export default LogItem;