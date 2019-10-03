import React from 'react';
import { render } from '@testing-library/react';
import { useStaticQuery } from 'gatsby';

import Image from '../Image';
import { PlaceHolderImgQuery } from '../../../graphqlTypes';

beforeEach(() => {
  const mockedUseStaticQuery = useStaticQuery as jest.Mock<PlaceHolderImgQuery>;
  mockedUseStaticQuery.mockImplementationOnce(() => ({
    placeholderImage: {
      childImageSharp: {
        fluid: {
          base64: '',
          aspectRatio: 1,
          sizes: `100 200 300`,
          src: `pretend-i-am-a-base64-encoded-image`,
          srcSet: `meaninglessSrcForTest`,
        },
      },
    },
  }));
});

describe(`Image`, () => {
  it(`renders an image`, () => {
    const { container } = render(<Image />);

    expect(container.querySelector(`picture`)).toBeInTheDocument();
  });
});
