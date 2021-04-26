import styled from '@emotion/styled';

// CollapseButton 한번 클릭하면 자식들이 살아났다가 다시 클릭하면 자식을 보여주는 버튼
export const CollapseButton = styled.button<{ collapse: boolean }>`
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 10px;
  cursor: pointer;
  ${({ collapse }) =>
    collapse &&
    `
    & i {
      transform: none;
    }
  `};
`;
