import { CloseModalButton } from '@components/Menu/styles';
import React, { CSSProperties, FC, useCallback } from 'react';
import { CreateMenu } from './styles';

interface Props {
  show: boolean;
  onCloseModal: (e: any) => void;
  style: CSSProperties;
  closeButton?: boolean;
}

const Menu: FC<Props> = ({ children, style, show, onCloseModal, closeButton }) => {
  const stopPropaggation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropaggation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

// 부모에서 프롭스를 안넘겨주면 기본값으로 설정가능!
Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
