import {useCallback, useState} from 'react';

export const useQRScanner = () => {
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);

  const readData = useCallback(({data: _data}) => setData(_data), []);
  const cleanData = useCallback(() => setData(null), []);

  const handleShow = useCallback(() => {
    setData(null);
    setVisible(true);
  }, []);
  const handleClose = useCallback(() => setVisible(false), []);

  return {
    data,
    visible,
    readData,
    cleanData,
    handleShow,
    handleClose,
  };
};
