/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";

const HomePageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
  h4 {
    font-size: 3rem;
    font-weight: 300;
    text-align: center;
  }
`;

const HomePage = () => {
  return (
    <div css={[HomePageStyle]}>
      <h1 className="title">Welcome to Movie Finder</h1>
      <h4>
        You can use this to find movies for you and your friends to watch!
      </h4>
    </div>
  );
};

export default HomePage;
