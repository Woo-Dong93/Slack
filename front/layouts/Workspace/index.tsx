import React, { VFC, useCallback, useState, useEffect } from 'react';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { useParams } from 'react-router';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import {
  Channels,
  Header,
  ProfileImg,
  RightMenu,
  WorkspaceWrapper,
  Workspaces,
  Chats,
  WorkspaceName,
  MenuScroll,
  ProfileModal,
  LogOutButton,
  WorkspaceButton,
  AddButton,
  WorkspaceModal,
} from './styles';
import gravatar from 'gravatar';
import loable from '@loadable/component';
import Menu from '@components/Menu';
import { IChannel, IUser } from '@typings/db';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import useSocket from '@hooks/useSocket';

const Channel = loable(() => import('@pages/Channel'));
const DirectMessage = loable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [showWorkpaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChaanelModal, setShowCreateChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

  const { workspace } = useParams<{ workspace: string }>();

  const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2???
  });

  // // ???????????? ????????? ???????????????
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

  // // ????????????????????? ????????? ????????? ????????? ????????????
  // const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    // ??????????????? ??? ????????? ??????, ????????? ????????? ????????? ???
    if (channelData && userData && socket) {
      // ???????????? ?????????????????? ?????????.
      socket.emit('login', { id: userData.id, channels: channelData.map((v) => v.id) });
    }
  }, [socket, channelData, userData]);

  // ????????? ????????????(workspace??? ?????? ???)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [workspace, disconnect]);

  // data??? ???????????? ?????????????????? false??? ????????? ?????????.
  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, { withCredentials: true }).then(() => {
      mutate(false, false);
    });
  }, []);

  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;

      axios
        .post(
          '/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          revalidate();
          setShowCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspace, newUrl],
  );

  // ????????? ?????? ?????? ????????? ????????????.
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);

  const toggleWorkpaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
            {showUserMenu && (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>????????????</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/??????`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkpaceModal}>Slack</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkpaceModal} onCloseModal={toggleWorkpaceModal} style={{ top: 85, left: 80 }}>
              <WorkspaceModal>
                <h2>Slact</h2>
                <button onClick={onClickInviteWorkspace}>????????????????????? ????????? ??????</button>
                <button onClick={onClickAddChannel}>?????? ?????????</button>
                <button onClick={onLogout}>????????????</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
            {/* {channelData?.map((v) => (
              <div key={v.id}>{v.name}</div>
            ))} */}
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>?????????????????? ??????</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>?????????????????? url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">????????????</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChaanelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </div>
  );
};

export default Workspace;
