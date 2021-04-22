import axios from 'axios';

// useSWR에 적은 첫번째 인자의 주소가 url인자로 들어옵니다.
// return해주는 data는 구조분해할당으로 {data}로 받을 수 있습니다.
const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then((response) => response.data);

export default fetcher;
