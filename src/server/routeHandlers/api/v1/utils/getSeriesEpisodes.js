import request from 'request';
import {
  TVDB_API__EPISODES_URL,
  TVDB__TOKEN__PAGE_NUM,
  TVDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import tvdbRequestProps from './tvdbRequestProps';
import tvdbResponseHandler from './tvdbResponseHandler';

const requestPageOfEpisodes = ({ jwt, pageNum = 1, seriesID }) => new Promise(
  (resolve, reject) => {
    request.get(
      TVDB_API__EPISODES_URL
        .replace(TVDB__TOKEN__SERIES_ID, seriesID)
        .replace(TVDB__TOKEN__PAGE_NUM, pageNum),
      { ...tvdbRequestProps({ jwt }) },
      tvdbResponseHandler(resolve, reject)
    );
  }
);

export default ({ jwt, seriesID }) => new Promise((resolve, reject) => {
  requestPageOfEpisodes({ jwt, seriesID })
    .then((resp) => {
      const { links } = resp;
      const pages = [Promise.resolve(resp)];
      
      if(links && links.last){
        // create promises for remaining pages
        for(let i=2; i<=links.last; i++){
          pages.push(requestPageOfEpisodes({ jwt, pageNum: i, seriesID }));
        }
      }
      
      Promise.all(pages)
        .then((_pages) => {
          const episodes = [];
          _pages.forEach((page) => { episodes.push(...page.data); });
          
          resolve(episodes);
        });
    })
    .catch((tvdbErr) => { reject(tvdbErr); });
});