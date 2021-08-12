# SWR 라이브러리

- Next.js로 유명한 vercel에서 만든 라이브러리 입니다.
  - 원격서버의 상태를 가져와서 리액트 컴포넌트에 꽂아주는 기능을 제공합니다.
  - `Get`요청에 특화되어 있고 나머지 `POST`요청에는 이점이 없습니다.
    - 공식문서에는 불가능한 것이 아니지만 이점이 없다고 나와있습니다.
    - `POST`를 사용하고 싶을 경우 `fetcher`함수를 직접 `POST`로 구현하면 됩니다.
- 설치하기

```
npm i swr
```



### 1. SWR 시작해보기

- 첫번째 인자 : Key( **API URL** )
- 두번째 인자 : fetch 함수, fetch함수의 인자로 Key에서 설정한 URL을 받아올 수 있습니다.
  - `fetch`에서 `return`한 `data`가 구조분해할당으로 `{ data, error }`에 들어가게 되고 error가 발생해도 들어가게 됩니다.

```react
import React from "react";
import useSWR from "swr";
import axios from "axios";

function App() {
  const fetcher = (url) => axios.get(url).then((response) => response.data);
  // data를 개명할 수도 있습니다. data: userData
  const { data, error } = useSWR("http://localhost:3095/api/users", fetcher);
	
  if(error){
    return <div>failed to load</div>
  }
    
  if(!data){
    return <div>Loading..</div>
  }
    
  return <div>{data}</div>;
}

export default App;
```

- `useSWR`은 한번 fetch 한 원격상태의 데이터를 내부적으로 **캐시**하고 다른 컴포넌트에서 동일한 상태를 사용하고자 할 경우( 첫번째 URL값이 같을 경우 ) 이전에 캐시했던 상태를 그대로 리턴해 줍니다 ( **동일한 상태를 공유할 수 있다!** )
  - 데이터의 추가/삭제/수정 작업이 발생할 때마다 원격의 상태와 로컬의 상태를 동기화시켜야 하는 작업을 수월하게 도와줍니다.
  - 즉  **SWR은 원격상태와 로컬상태를 하나로 통합합니다.** 



### 2. SWR은 어떻게 원격상태와 로컬상태를 하나로 통합할까?

- 네트워크가 offline 에서 online 으로 바뀔 때 스스로 재요청 합니다.
- 브라우저 창이 Focus를 얻을 때 재요청 합니다. ( 브라우저 탭 변경이 되었을 때 등 )
- 개발자가 직접 polling 주기를 설정할 수 있습니다.
- 만약에 여러 컴포넌트가 동일한 API주소로 SWR을 통해 요청할 때에 요청은 한개만 가게 됩니다.
  - SWR는 URL을 기준으로 캐싱을 합니다.
  - 만약에 한 화면에서 똑같은 URL로 데이터를 가져온다면 그 데이터를 캐시에 기억하다가 다른 컴포넌트에서 요청시에 그 데이터를 활용합니다. ( **알아서 캐시 관리** )



### 3. 커스텀 훅으로 만들기

- 원격서버의 상태를 로컬의 상태로 다룰 수 있게 됩니다.

```js
import useSWR from 'swr'

export default () => {
  const {data, error} = useSWR('/api/주소', url => {
    return fetch(url).then(res => res.json())
  })
  return {data, error}
}
```



### 4. mutate

- 사용자가 정보를 수정할 경우 SWR의 polling을 기다리기보다는 바로 내부 상태를 수정하여 화면에 변경된 데이터를 보여주고 서버를 갱신하는 것이 효율적입니다.
- `mutate`함수를 호출하면 해당 상태를 즉시 다시 fetch하고 데이터를 갱신합니다.
  - `mutate()` : fetch를 통해 데이터 갱신
- fetch없이 로컬의 캐시되었던 상태만 갱신하는 것도 가능합니다.
  - 첫번재 인자 : 갱신할 데이터
  - 두번째 인자 : 데이터 fetch 여부

```react
const { data, error, mutate } = useSWR("http://localhost:3095/api/users", fetcher);

const handler = () = > {
    // fetch하지 않고 내부 캐시만 갱신합니다.
    mutate(user, false) 
}  
```

- 범용적으로 `mutate`를 활용할 수 있습니다.
  - 첫번째 인자에 Key값을 넣어줘야 합니다.
  - 컴포넌트에서 useSWR을 선언하면 무조건 1번은 API를 호출하게 됩니다. 이것도 방지하고 싶을 때 범용적 `mutate`를 활용합니다.

```react
import useSWR, {mutate} from 'swr'

const handler = () = > {
    // fetch하지 않고 내부 캐시만 갱신합니다.
    mutate('http://localhost.com', user, false) 
}  
```

- Optimistic UI에 활용할 수 있습니다.
  - 미리 성공한다고 생각해서 미리 적용하고 서버에 적용하는 것!

### 5. revalidate

- 개발자가 원할 때 SWR을 요청합니다.

```js
const { data, error, revalidate } = useSWR("http://localhost:3095/api/users", fetcher);

const handler = () = > {
    revalidate();
}  
```



### 6. Option : 3번째 인자에 넣을 수 있습니다.

- `dedupingInterval : 100000` = SWR이 주기적으로 요청하는 것을 막을 수 있습니다. (캐시의 유지기간)
  - 100초마다 서버와 통신에 데이터를 가져오고 그 전에는 캐시된 데이터를 계속 사용하겠다.

```react
const { data, error, revalidate } = useSWR('http://localhost:3095/api/users', fetcher, { 
    dedupingInterval: 100000,
});
```

- `focusThrottleInterval : 5000` = revalidate 5초의 한번씩 제한걸어주기
- `errorRetryInterval : 5000` = 서버에 에러가 나도 5초뒤에 포기하지 않고 재요청을 보내기
- `loadingTimeout : 3000` = loading 상태 제한 시간
- `errorRetryCount` = 에러가 왔음에도 다시 재요청 할 때 최대 몇번까지 요청하는지 설정할 수 있다.
- `revalidateOnFocus : true` = 다른 tab에 갔다가 다시 focus를 얻을 때 재 실행 여부
- `revalidateOnReconnect : true` = 브라우저 network가 다시 연결되었을 때 재 실행 여부
- `refreshWhenHidden : false` = window에 focus가 없을 때에도 polling 여부
- `refreshInterval : 1000` = 1초마다  계속 polling합니다.
  - 기본값 : 0



### 7. 로컬 환경의 상태관리도 가능합니다.

-  `window`, `sessionStorage`, `localStorage`, 클로져 변수 등을 적절하게 사용하면 가능합니다.

```react
import useSWR from 'swr'

function useCounter(){
  const {data, mutate} = useSWR('state', () => window.count)
  return {data, mutate: (count) => {
    window.count = count
    return mutate()
  }}
}

function Counter(){
  const {data, mutate} = useCounter()
  
  const handleInc = () => mutate(data + 1)
  const handleDec = () => mutate(data - 1)

  return (
      <div>
        <span>count: {data}</span>
        <button onClick={handleInc}>inc</button>
        <button onClick={handleDec}>dec</button>
      </div>
  )
}
```

- 로컬 스토리지 활용

```js
const {data, mutate} = useSWR('hello', (key) => {localStorage.setItem('data', key); return localStorage.getItem('data')});
```

```js
// 가져오기
const {data} = useSWR('hello')
```



### 8. 같은 주소에 fetcher를 다르게 사용하기

- #을 활용하면 됩니다.

```js
// 서버는 #을 무시하기 때문에 다른 key값으로 인식할 수 있습니다.
useSWR("http://localhost:3095/api/users", fetcher);
useSWR("http://localhost:3095/api/users#123", fetcher);
```

