/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';

const SettingsPageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const SettingsPage = () => {
  return (
    <div css={[SettingsPageStyle]}>
      <h1 className="title">Hello Settings!</h1>
    </div>
  );
};

export default SettingsPage;
