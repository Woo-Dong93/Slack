import React, { useCallback } from 'react';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IDM } from '@typings/db';
import makeSection from '@utils/makeSection';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();

  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  const { data: chatData, mutate: mutateChat, revalidate } = useSWR<IDM[]>(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
  );

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      // 채팅이 실제로 존재하면
      if (chat?.trim()) {
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
            setChat('');
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    [chat],
  );

  // 정보가 없으면 화면 띄어주지 않기
  if (!userData || !myData) {
    return null;
  }

  // 그냥 reverse()는 기존 배열이 바뀌어버린다. (immutable하지 않다.)
  const chatSections = makeSection(chatData ? [...chatData].reverse() : []);

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
