import { Dispatch, SetStateAction, useCallback, useState } from 'react';

type ReturnTypes<T = any> = [T, (e: React.ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>];

const useInput = <T = any>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);

  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, handler, setValue];
};

export default useInput;
