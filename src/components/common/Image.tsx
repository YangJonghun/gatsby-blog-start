import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img, { GatsbyImageProps } from 'gatsby-image';

import { PlaceHolderImgQuery } from '../../graphqlTypes';

/*
 * This component is built using `gatsby-image` to automatically serve optimized
 * images with lazy loading and reduced file sizes. The image is loaded using a
 * `useStaticQuery`, which allows us to load the image from directly within this
 * component, rather than having to pass the image data down from pages.
 *
 * For more information, see the docs:
 * - `gatsby-image`: https://gatsby.dev/gatsby-image
 * - `useStaticQuery`: https://www.gatsbyjs.org/docs/use-static-query/
 */

const LOAD_PLACEHOLDER_IMG = graphql`
  query PlaceHolderImg {
    placeholderImage: file(relativePath: { eq: "gatsby-astronaut.png" }) {
      childImageSharp {
        fluid(maxWidth: 300) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;

const Image: React.FC<GatsbyImageProps> = () => {
  const { placeholderImage } = useStaticQuery<PlaceHolderImgQuery>(LOAD_PLACEHOLDER_IMG);

  return <Img fluid={placeholderImage.childImageSharp.fluid} />;
};

export default Image;
