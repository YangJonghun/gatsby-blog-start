import React from 'react';
import { render } from '@testing-library/react';
import { useStaticQuery } from 'gatsby'; // mocked

import Image from '../Image';

beforeEach(() => {
  const mockedUseStaticQuery = useStaticQuery as jest.Mock;
  mockedUseStaticQuery.mockImplementationOnce(() => ({
    placeholderImage: {
      childImageSharp: {
        fluid: {
          aspectRatio: 1,
          sizes: `100 200 300`,
          src: `pretend-i-am-a-base64-encoded-image`,
          srcSet: `asdfasdf`,
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
