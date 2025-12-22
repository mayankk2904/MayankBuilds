// components/TextLoader.tsx
"use client"

import React from "react"
import styled from "styled-components"

const TextLoader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
<p>Loading</p>
<div className="words">
  <span className="word">interfaces</span>
  <span className="word">navigation</span>
  <span className="word">transitions</span>
  <span className="word">animations</span>
  <span className="word">interfaces</span>
</div>

      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .loader {
    color: rgb(124, 124, 124);
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    font-size: 25px;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    height: 40px;
    padding: 10px 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    border-radius: 8px;
  }

  .words {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .words::after {
    content: "none";
  }

  .word {
    display: block;
    height: 100%;
    padding-left: 6px;
    color: hsl(var(--primary));
    animation: spin_4991 4s infinite;
  }

  @keyframes spin_4991 {
    10% {
      -webkit-transform: translateY(-102%);
      transform: translateY(-102%);
    }

    25% {
      -webkit-transform: translateY(-100%);
      transform: translateY(-100%);
    }

    35% {
      -webkit-transform: translateY(-202%);
      transform: translateY(-202%);
    }

    50% {
      -webkit-transform: translateY(-200%);
      transform: translateY(-200%);
    }

    60% {
      -webkit-transform: translateY(-302%);
      transform: translateY(-302%);
    }

    75% {
      -webkit-transform: translateY(-300%);
      transform: translateY(-300%);
    }

    85% {
      -webkit-transform: translateY(-402%);
      transform: translateY(-402%);
    }

    100% {
      -webkit-transform: translateY(-400%);
      transform: translateY(-400%);
    }
  }`;

export default TextLoader;