/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';

const BrowsePageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const BrowsePage = () => {
  return (
    <div css={[BrowsePageStyle]}>
      <h1 className="title">Hello Browse!</h1>
    </div>
  );
};

export default BrowsePage;
