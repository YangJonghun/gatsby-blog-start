import React from 'react';
import { render } from '@testing-library/react';
import { useStaticQuery } from 'gatsby'; // mocked

import Layout from '../Layout';

import { SiteTitleQuery } from '../../graphqlTypes';

beforeEach(() => {
  const mockedUseStaticQuery = useStaticQuery as jest.Mock<SiteTitleQuery>;
  mockedUseStaticQuery.mockImplementationOnce(() => ({
    site: {
      siteMetadata: {
        title: `GatsbyJS`,
      },
    },
  }));
});

describe(`Layout`, () => {
  it(`renders a header`, () => {
    const { container } = render(
      <Layout>
        <main>
          <h1>hello</h1>
        </main>
      </Layout>,
    );

    expect(container.querySelector(`header`)).toBeInTheDocument();
  });

  it(`renders children`, () => {
    const text = `__Hello world__`;
    const { getByText } = render(
      <Layout>
        <main>
          <h1>{text}</h1>
        </main>
      </Layout>,
    );

    const child = getByText(text);

    expect(child).toBeInTheDocument();
  });
});
