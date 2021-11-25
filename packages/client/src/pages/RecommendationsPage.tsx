/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';

const RecommendationPageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const RecommendationPage = () => {
  return (
    <div css={[RecommendationPageStyle]}>
      <h1 className="title">Hello Recommendations!</h1>
    </div>
  );
};

export default RecommendationPage;
