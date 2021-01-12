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
        warnings.map((warning, ndx) => {
          let isLink = false;
          let _warning = warning;
          let warningHasHTML = false;
          
          if(_warning.startsWith('http')){
            isLink = true;
            _warning = <a href={warning} target="_blank" rel="noopener noreferrer">{warning}</a>;
          }
          else if(_warning.includes('"http')){
            const urls = (_warning.match(/"(http[^"]+)"/g) || []);
            
            urls
              .reduce((arr, url) => {
                if(!arr.includes(url)) arr.push(url);
                return arr;
              }, [])
              .forEach(url => {
                const _url = url.replace(/"/g, '');
                const anchor = `<a href="${ _url }" target="_blank" rel="noopener noreferrer">${ _url }</a>`;
                _warning = _warning.replace(new RegExp(url, 'g'), `&quot;${ anchor }&quot;`);
                warningHasHTML = true;
              });
          }
          
          return (
            <div key={`${ time }_${ ndx }`} className={`${ ROOT_CLASS }__warning`}>
              {!isLink && (
                <span className={`${ ROOT_CLASS }__warning-icon`}>&#x26A0;</span>
              )}
              {warningHasHTML && <span dangerouslySetInnerHTML={{ __html: _warning }} /> || _warning}
            </div>
          );
        })
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