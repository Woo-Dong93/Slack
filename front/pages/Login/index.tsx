import useInput from '@hooks/useInput';
import React, { useCallback, useState } from 'react';
import { Form, Error, Label, Input, LinkContainer, Button, Header } from '@pages/SignUp/styles';
import axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';

const Login = () => {
  // http://localhost:9035/api/users은 로그인 안되어있으면 false를 반환, 로그인 되어있으면 정보를 반환
  // 첫번째 요청은 get요청의 주소, 두번째 인자는 fetcher라는 함수 = 앞에 쓴 주소를 어떻게 처리할 것인지 적어줍니다. (util에 직접구현)
  // fetcher가 반환한 data를 구조분해할당으로 받을 수 있고 만약 에러가 발생하면 그 에러도 받을 수 있다.
  // swr은 로딩상태도 알 수 있다.( data가 존재하지 않은 상태를 로딩상태!)
  const { data, error, revalidate, mutate } = useSWR('http://localhost:3095/api/users', fetcher);

  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          '/api/users/login',
          {
            email,
            password,
          },
          { withCredentials: true },
        )
        .then((response) => {
          // 재전송을 하지말고 그냥 상태를 업데이트 시킨다!
          mutate(response.data, false);
          //revalidate();
        })
        .catch((error) => {
          setLogInError(error.response?.data?.statusCode === 401);
        })
        .finally(() => {});
    },
    [email, password],
  );

  if (data === undefined) {
    return <div>로딩중...</div>;
  }
  //로그인하기를 누르면 data가 바뀌면서 리렌더링이 일어나고 다시 이 조건문에 걸리게 된다.
  if (data) {
    return <Redirect to="/workspace/slack/channel/일반" />;
  }

  return (
    <div id="container">
      <Header>Slack</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default Login;
