import React, { useCallback, useEffect, useRef } from 'react';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import useSWR, { useSWRInfinite } from 'swr';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IDM } from '@typings/db';
import makeSection from '@utils/makeSection';
import { Scrollbars } from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();

  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // 소켓 연결하기
  const [socket] = useSocket(workspace);

  // 데이터가 비어있을 경우
  const isEmpty = chatData?.[0]?.length === 0;
  // 데이터 갯수 45개 => 20 + 20 + 5 => isEmpty는 아니지만 데이터를 다가져왔다는 의미
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const scrollbarRef = useRef<Scrollbars>(null);
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      // 채팅이 실제로 존재하면
      if (chat?.trim() && chatData) {
        // 무한스크롤이라 2차원배열이다. 가장 최신데이터가 [0]에 들어있다.
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            // DM 객체
            id: (chatData[0][0]?.id || 0) + 1,
            SenderId: myData.id, // 보낸 사람 아이디
            Sender: myData,
            ReceiverId: userData.id, // 받는 사람 아이디
            Receiver: userData,
            content: savedChat,
            createdAt: new Date(),
          });

          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });

        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  // socket.io가 서버로 부터 실시간으로 데이터를 가져오는데 그것을 또 서버에 저장할 필요가 없다.
  const onMessage = useCallback(
    (data: IDM) => {
      // 위에서 이미 내가 채팅을 치면 mutate를 해주기 때문에 내 채팅이 아닌 경우에만 mutate해야합니다.
      // 상대방의 세 메시지만 들어가게!
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          if (chatData !== undefined) {
            chatData = [[data, ...chatData[0]]];
          }
          //chatData?.[0].unshift(data);

          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            // 남이 채팅을 치면 스크롤바가 내려가면 안됩니다.
            // 그래서 내가 150px이상 올렸을 때에는 안내려고 150px미만일때에는 바로 밑으로 내려줍니다.
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              //console.log('scrollToBottom!', scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 50);
            }
          }
        });
      }
    },
    [chatData, scrollbarRef],
  );

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  //로딩시 스크롤바 아래로
  useEffect(() => {
    // 데이터가 존재할 경우
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  // 정보가 없으면 화면 띄어주지 않기
  if (!userData || !myData) {
    return null;
  }

  // 2차원배열을 1차원배열로 만들기
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
