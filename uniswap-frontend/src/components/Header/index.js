import React from 'react'
import styled from 'styled-components'

import { Link } from '../../theme'
import Web3Status from '../Web3Status'
import { darken } from 'polished'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const HeaderElement = styled.div`
  margin: 1.25rem;
  display: flex;
  min-width: 0;
  display: flex;
  align-items: center;
`

const Nod = styled.span`
  transform: rotate(0deg);
  transition: transform 150ms ease-out;

  :hover {
    transform: rotate(-10deg);
  }
`

const Title = styled.div`
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }

  #link {
  }
  text-decoration-color: ${({ theme }) => theme.UniswapPink};
  color: ${({ theme }) => theme.wisteriaPurple};

  #title {
    display: inline;
    font-size: 1rem;
    font-weight: 500;
    :hover {
      color: ${({ theme }) => darken(0.1, theme.wisteriaPurple)};
    }
  }
`

export default function Header() {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Title>
          <Link id="link" href="#">
            <h1 id="title">Candy Shop</h1>
          </Link>
        </Title>
      </HeaderElement>
      <HeaderElement>
        <Web3Status />
      </HeaderElement>
    </HeaderFrame>
  )
}
