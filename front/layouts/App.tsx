import React from 'react';
import loable from '@loadable/component';
import { Switch, Route, Redirect } from 'react-router-dom';

const Login = loable(() => import('@pages/Login'));
const SignUp = loable(() => import('@pages/SignUp'));
const Workspace = loable(() => import('@layouts/Workspace'));

const App = () => {
  return (
    //Switch : 여러개 중 하나만 선택하는 라우터 ( 아래 3개중 하나만 선택해서 컴포넌트를 보여주게됩니다. 라우터로 감싸줘야 합니다.
    //Redirect : 다른페이지로 돌려주는 역할, 주소가 /로 끝나면 /login으로 옮겨줍니다.
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/workspace/:workspace" component={Workspace} />
    </Switch>
  );
};

export default App;
