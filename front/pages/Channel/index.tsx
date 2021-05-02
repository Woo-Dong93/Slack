import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import InviteChannelModal from '@components/InviteChannelModal';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import { Container, Header } from './styles';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  // 채널데이터 가져오기
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);

  // 채널의 채팅내역 가져오기
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // 채널에 참가중인 멤버 가져오기
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  // 소켓 연결하기
  const [socket] = useSocket(workspace);

  // 데이터가 비어있을 경우
  const isEmpty = chatData?.[0]?.length === 0;
  // 데이터 갯수 45개 => 20 + 20 + 5 => isEmpty는 아니지만 데이터를 다가져왔다는 의미
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const scrollbarRef = useRef<Scrollbars>(null);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      // 채팅이 실제로 존재하면
      if (chat?.trim() && chatData && channelData) {
        // 무한스크롤이라 2차원배열이다. 가장 최신데이터가 [0]에 들어있다.
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            // 채널 객체
            id: (chatData[0][0]?.id || 0) + 1,
            UserId: myData.id, // 보낸 사람 아이디
            User: myData,
            content: savedChat,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });

          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });

        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
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
    [chat, chatData, myData, channelData, workspace, channel],
  );

  // socket.io가 서버로 부터 실시간으로 데이터를 가져오는데 그것을 또 서버에 저장할 필요가 없다.
  const onMessage = useCallback(
    (data: IChat) => {
      // 내 채널명이랑 같은지 확인 and 내가 입력한 데이터는 걸러야 한다.
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
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
    [channel, myData],
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
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
  if (!myData) {
    return null;
  }

  // 2차원배열을 1차원배열로 만들기
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);
  // const [chat, onChangeChat] = useInput('');

  // const onSubmitForm = useCallback((e) => {
  //   e.preventDefault();
  // }, []);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  return (
    // <Container>
    //   <Header>채널!</Header>
    //   {/* <ChatList /> */}
    //   <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    // </Container>
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
