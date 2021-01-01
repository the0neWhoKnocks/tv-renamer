import React from 'react';
import { arrayOf, number, string } from 'prop-types';
import styles, { ROOT_CLASS } from './styles';

const LogItem = ({
  deleted,
  error,
  time,
  to,
  warnings,
}) => (
  <div className={`${ ROOT_CLASS } ${ styles }`}>
    <div className={`${ ROOT_CLASS }__time`}>
      {new Date(time).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
    </div>
    <div className={`${ ROOT_CLASS }__body`}>
      {(!error && to) && (
        <div className={`${ ROOT_CLASS }__to`}>{to}</div>
      )}
      {error && (
        <div className={`${ ROOT_CLASS }__error`}>{error}</div>
      )}
      {warnings && (
        warnings.map((warning, ndx) => (
          <div key={`${ time }_${ ndx }`} className={`${ ROOT_CLASS }__warning`}>
            <span className={`${ ROOT_CLASS }__warning-icon`}>&#x26A0;</span>
            {warning}
          </div>
        ))
      )}
      {(!error && deleted) && (
        deleted.map((deletedPath, ndx) => (
          <div key={`${ time }_${ ndx }`} className={`${ ROOT_CLASS }__deleted`}>
            <span className={`${ ROOT_CLASS }__deleted-icon`}>&#x2714;</span>
            Deleted folder: <span className={`${ ROOT_CLASS }__deleted-path`}>&quot;{deletedPath}&quot;</span>
          </div>
        ))
      )}
    </div>
  </div>
);

LogItem.propTypes = {
  deleted: arrayOf(string),
  error: string,
  time: number,
  to: string,
  warnings: arrayOf(string),
};

export default LogItem;