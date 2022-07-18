import axios from 'axios';
import {io} from 'socket.io-client';

const _addSocketIdToEveryRequest = _socket => {
  axios.interceptors.request.use(config => {
    config.headers.socketid = _socket.id;
    return config;
  });
};

let socket = null;

export default ({serverUrl} = {}) => {
  const logger = msg => console.log(`Socket:(${socket.id || '-'}): ${msg}`);
  const get = () => socket;

  const create = () => {
    if (!socket) {
      socket = io(serverUrl, {withCredentials: true});

      socket.on('connect', () => {
        logger(socket.connected); // true
      });

      socket.on('disconnect', () => {
        logger(socket.connected); // false
        destroy();
      });

      _addSocketIdToEveryRequest(socket);
    }
  };

  const destroy = () => {
    socket?.close();
    socket = null;
  };

  const on = ({eventName, handler}) => {
    if (socket) {
      socket.on(eventName, handler);
    }
  };

  return {
    get,
    create,
    destroy,
    on,
  };
};

export const WebSocketEvents = {
  // Websocket events
  connection: 'connection',
  disconnect: 'disconnect',
  connectError: 'connect_error',
  reconnectAttempt: 'reconnect_attempt',

  // App events
  jobUpdate: 'jobUpdate',
  nodesUpdate: 'nodesUpdate',
  nodesUpdateCompleted: 'nodesUpdateCompleted',
  nodeValidationsUpdate: 'nodeValidationsUpdate',
  recordDelete: 'recordDelete',
  error: 'threadError',
  recordSessionExpired: 'recordSessionExpired',
  applicationError: 'applicationError',
};
