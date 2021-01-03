const { Server } = require('ws');
// import {
//   WS__MSG_TYPE__RENAME_STATUS,
// } from 'ROOT/conf.app';
import logger from 'SERVER/utils/logger';

const log = logger('server:socket');

export default function socket(server) {
  const wss = new Server({ server });
  
  wss.on('connection', function connected(socket) {
    log('Client connected');
    server.clientSocket = socket;
    
    // socket.on('message', (payload) => {
    //   const { /* data, */ type } = JSON.parse(payload);
    // 
    //   log(`[HANDLE] "${ type }"`);
    // });
    
    socket.on('close', (code, reason) => {
      log('User disconnected');
      delete server.clientSocket;
    });
  });
}
