import React, { FC, useCallback } from 'react';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

const Workspace: FC = ({ children }) => {
  const { data, error, revalidate } = useSWR('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 100000,
  });

  // data가 내정보가 들어가있다가 false로 바뀌게 됩니다.
  const onLogout = useCallback(() => {
    axios.post('http://localhost:3095/api/users/logout', null, { withCredentials: true }).then(() => {
      revalidate();
    });
  }, []);

  if (!data) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
