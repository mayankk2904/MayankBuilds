// components/CombinedLoader.tsx
"use client"

import styled from "styled-components"
import HandLoader from "./Loader"
import TextLoader from "./TextLoader"

const CombinedLoader = () => {
  return (
    <Wrapper>
      <HandLoader />
      <TextLoader />
    </Wrapper>
  )
}

export default CombinedLoader

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background-color: rgba(0, 0, 0, 0.); /* Semi-transparent black */
  padding: 3rem;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  
  @media (max-width: 768px) {
    padding: 2rem;
    gap: 1.5rem;
  }
`