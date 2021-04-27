import { IDM } from '@typings/db';
import dayjs from 'dayjs';

// 채팅 리스트를 받아서 그룹화해서 돌려줍니다.
// [{id: 1, d: '2021-04-01'}, {id: 2, d: '2021-04-02'}, {id: 3, d: '2021-04-03'}]
export default function makeSection(chatList: IDM[]) {
  const sections: { [key: string]: IDM[] } = {};
  chatList.forEach((chat) => {
    const monthData = dayjs(chat.createdAt).format('YYYY-MM-DD');

    if (Array.isArray(sections[monthData])) {
      sections[monthData].push(chat);
    } else {
      sections[monthData] = [chat];
    }
  });

  return sections;
}
