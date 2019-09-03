import React from 'react';
import Helmet from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

import { SiteMetaDataQuery } from '../graphqlTypes';

const GET_META_DATA = graphql`
  query SiteMetaData {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`;

type MetaProps = React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;

interface SeoProps {
  description?: string;
  lang?: string;
  meta?: MetaProps[];
  title: string;
}

const SEO: React.FC<SeoProps> = ({ description = '', lang = 'en', meta = [], title }) => {
  const { site } = useStaticQuery<SiteMetaDataQuery>(GET_META_DATA);

  const metaDescription = description || site.siteMetadata.description;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        ...meta,
      ]}
    />
  );
};

export default SEO;
