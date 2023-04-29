import * as React from 'react';

import TextBase from '../TextBase';

const TextTitle = ({children, size}) => (
  <TextBase type="title" size={size}>
    {children}
  </TextBase>
);

export default TextTitle;
