import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';

import Header from './Header';

const GET_SITE_TITLE = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

const BodyWrapper = styled.div`
  margin: 0 auto;
  max-width: 960px;
  padding: 0px 1.0875rem 1.45rem;
  padding-top: 0;
`;

const Layout: React.FC = ({ children }) => {
  const data = useStaticQuery(GET_SITE_TITLE);

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      <BodyWrapper>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </BodyWrapper>
    </>
  );
};

export default Layout;
