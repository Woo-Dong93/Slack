# DM 목록 만들기

- 웹팩의 프록시 서버를 사용하는 이유 : **로컬호스트** 같은 주소를 안써야 나중에 배포할 때 오류를 사전에 방지하고 생산성을 증가시킬 수 있다.
  - 배포할 때에는 프록시 서버의 설정이 적용이 안됩니다!
- 주석보다는 함수와 변수 이름을 잘지어서 활용해라!
  - 함수 : 동사 => 주석을 대신할 수 있다!
  - 변수 : 명사
  - 단점 : 팀원들이 영어를 잘해야 한다.
- 라우터
  - `<Link`>와 비슷하지만 `activeClassName`을 둘 수 있습니다.
  - 지금 주소와 링크의 주소가 같으면 `activeClassName`가 `selected`적용되면서 시각적 효과를 보여줍니다.

```react
<NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
```

- `swr`을 활용하면 props으로 데이터를 넘겨줄 필요가 없다.
  - 컴포넌트 자체에서 데이터를 가져올 수 있다 => 컨테이너 컴포넌트 패턴이 없어지기 시작했다. ( 공식문서에서도 말함 )
  - 하지만 `props`는 완전히 사라진 것은 아니다. `swr`를 사용한 데이터가 아닐 경우에는 사용해야 한다.
  - 최대한 덜 쓰는 것이 좋다=>부모가 바뀌면 자식도 리렌더링되는 것을 방지
    - 예전에는 `React.memo`를 활용해 막았다.
    - 지금은 연결고리가 끊어졌기 때문에 자식만 바뀌고 부모가 바뀌지 않게 할 수 있다.

- 보통 없는 주소로 api를 요청 할 경우 성공(304)로 뜨면서 html 페이지를 보내주는 경우도 있다.





### Props의 목적

- 컴포넌트의 재사용을 위해 메소드 등을 부모로 부터 작성해서 내려받는다!



### TextArea Enter

- enter일때 submit 하기

```react
const onKeydownChat = useCallback((e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        onSubmitForm(e);
      }
    }
  }, []);
```



### TextArea 자동 늘어나기 라이브러리 사용

```
npm i autosize
npm i @types/autosize
```

- ChatBox.tsx

```react
import autosize from 'autosize';

const ChatBox: VFC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  // 타입스크립트에서만 useRef에 type과 null로 초기화 해야 합니다.  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // useEffet를 활용해서 존재할 경우 autosize 적용
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeydownChat = useCallback((e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        onSubmitForm(e);
      }
    }
  }, []);

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editer-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeydownChat}
          placeholder={placeholder}
          ref={textareaRef}
        />
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
```



### Hooks의 의존성 배열을 eslint로 미리 체크해주기

- 설치

```
npm i -D eslint-config-react-app
npm i -D eslint-plugin-flowtype
npm i -D eslint-plugin-import
npm i -D eslint-plugin-jsx-a11y
npm i -D eslint-plugin-react
```

- 방법
  - `react-app` 추가
  - swr의 mutate는 절대 바뀌지 않아 안넣어져도 되지만 이것도 넣으라고 하긴함.. 그렇게 똑똑하지 않다.

```react
{
  "extends": ["plugin:prettier/recommended", "react-app"],
  "parser": "babel-eslint",
}
```

