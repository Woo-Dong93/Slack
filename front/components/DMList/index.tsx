// import useSocket from '@hooks/useSocket';
import { CollapseButton } from '@components/DMList/styles';
import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';

const DMList: FC = () => {
  const { workspace } = useParams<{ workspace?: string }>();

  const { data: userData, error, revalidate, mutate } = useSWR<IUser>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });

  // 워크스페이스에 참여한 멤버들
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );
  const [socket] = useSocket(workspace);

  // collapse 버튼의 상태
  const [channelCollapse, setChannelCollapse] = useState(false);

  const [onlineList, setOnlineList] = useState<number[]>([]);

  // collapse 버튼의 메서드
  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  useEffect(() => {
    // console.log('DMList: workspace 바꼈다', workspace);
    setOnlineList([]);
  }, [workspace]);

  useEffect(() => {
    // 서버로 부터 누가 online인지 알 수 있게 됩니다. ( 이벤트 리스너 )
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
    // socket?.on('dm', onMessage);
    // console.log('socket on dm', socket?.hasListeners('dm'), socket);
    return () => {
      // socket?.off('dm', onMessage);
      // console.log('socket off dm', socket?.hasListeners('dm'));
      // on과 off는 짝이므로 off를 통해 정리해줘야 합니다.
      // off를 활용하지 않으면 on이 5번 쌓일 경우 5번 받게 됩니다.
      socket?.off('onlineList');
    };
  }, [socket]);
  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span>{member.nickname}</span>
                {member.id === userData?.id && <span> (나)</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;
