import getSeriesId from './getSeriesId';
import lookUpEpisodes from './lookUpEpisodes';

export default ({ cache, jwt, seriesName }) => new Promise(
  (resolve, reject) => {
    if(cache[seriesName]){
      console.log(`Skipping series look-up for: "${ seriesName }"`);
      resolve(cache[seriesName]);
    }
    else{
      console.log(`Looking up series: "${ seriesName }"`);
      
      getSeriesId({ jwt, name: seriesName })
        .then(({ data: seriesMatches }) => {
          // for now, just care about an exact name match
          let seriesID;
          
          for(let i=0; i<seriesMatches.length; i++){
            const { id, seriesName } = seriesMatches[i];
            if(seriesName === seriesName){
              seriesID = id;
              break;
            }
          }
          
          return (seriesID) ? seriesID : Promise.reject();
        })
        .then((seriesID) => lookUpEpisodes({ jwt, seriesID, seriesName }))
        .then((cache) => resolve(cache))
        .catch(({ err, resp }) => {
          let error = `Couldn't find exact match for series: "${ seriesName }"`;
          if(resp) error += ` | ${ resp.statusCode } - ${ err }`;
        
          resolve({ error, name: seriesName });
        });
    }
  }
);