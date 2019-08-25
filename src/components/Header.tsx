import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

interface HeaderProps {
  siteTitle: string;
}

const HeaderWrapper = styled.header`
  background: rebeccapurple;
  margin-bottom: 1.45rem;
`;

const HeaderContentsWrapper = styled.div`
  margin: 0 auto;
  max-width: 960px;
  padding: 1.45rem 1.0875rem;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
`;

const Header: React.FC<HeaderProps> = ({ siteTitle = '' }) => (
  <HeaderWrapper>
    <HeaderContentsWrapper>
      <h1 style={{ margin: 0 }}>
        <StyledLink to="/">{siteTitle}</StyledLink>
      </h1>
    </HeaderContentsWrapper>
  </HeaderWrapper>
);

export default Header;
