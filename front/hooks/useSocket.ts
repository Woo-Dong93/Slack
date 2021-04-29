import io from 'socket.io-client';
import { useCallback } from 'react';

const backUrl = 'http://192.168.0.6:3095';
const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      //연결을 끊는 함수
      sockets[workspace].disconnect();
      // 객체에서 지우기
      delete sockets[workspace];
    }
  }, []);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    // 서버와 연결하기, soccket을 통해 서버와 소통할 수 있다.
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
