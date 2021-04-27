import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { VFC } from 'react';
import { ChatZone, Section } from './styles';

interface Props {
  chatData?: IDM[];
}

const ChatList: VFC<Props> = ({ chatData }) => {
  return (
    <ChatZone>
      {chatData?.map((chat) => (
        <Chat key={chat.id} data={chat} />
      ))}
    </ChatZone>
  );
};

export default ChatList;
