import React from 'react';
import { render, waitForDomChange } from '@testing-library/react';
import { useStaticQuery } from 'gatsby';

import SEO from '../SEO';
import { SiteMetaDataQuery } from '../../graphqlTypes';

const siteMetadata = {
  title: 'default titleTemplate',
  description: 'default description',
  author: 'default author',
};

beforeEach(() => {
  const mockedUseStaticQuery = useStaticQuery as jest.Mock<SiteMetaDataQuery>;
  mockedUseStaticQuery.mockImplementationOnce(() => ({
    site: {
      siteMetadata,
    },
  }));
});

describe(`SEO`, () => {
  const queryResult = siteMetadata;
  it(`prints title meta tag properly`, async () => {
    const title = 'testTitle';
    render(<SEO title={title} />);
    await waitForDomChange();
    expect(document.title.includes(title)).toBe(true);
    expect(document.title.includes(queryResult.title)).toBe(true);
    expect(document.title).toBe(`${title} | ${queryResult.title}`);
  });

  it(`set language value properly`, async () => {
    render(<SEO title="temp" lang="ko" />);
    await waitForDomChange();
    expect(document.documentElement.lang).toBe('ko');
  });

  it(`prints description content properly`, async () => {
    render(<SEO title="temp" />);
    await waitForDomChange();
    const metaTags: HTMLCollectionOf<HTMLMetaElement> = document.getElementsByTagName('meta');
    const isIncludeDescription = Array.from(metaTags).some(
      meta => meta.getAttribute('name') === 'description' && meta.getAttribute('content') === siteMetadata.description,
    );
    expect(isIncludeDescription).toBe(true);
  });

  it(`prints OG(Open Graph) tags properly`, async () => {
    const title = 'titleForOG';
    render(<SEO title={title} />);
    await waitForDomChange();
    const metaTags: HTMLCollectionOf<HTMLMetaElement> = document.getElementsByTagName('meta');
    const metaTagsArray = Array.from(metaTags);
    const isIncludeTitle = metaTagsArray.some(
      meta => meta.getAttribute('property') === 'og:title' && meta.getAttribute('content') === title,
    );
    expect(isIncludeTitle).toBe(true);
    const isIncludeDesc = metaTagsArray.some(
      meta =>
        meta.getAttribute('property') === 'og:description' && meta.getAttribute('content') === siteMetadata.description,
    );
    expect(isIncludeDesc).toBe(true);
  });

  it(`prints Twitter tags properly`, async () => {
    const title = 'titleForTwitter';
    render(<SEO title={title} />);
    await waitForDomChange();
    const metaTags: HTMLCollectionOf<HTMLMetaElement> = document.getElementsByTagName('meta');
    const metaTagsArray = Array.from(metaTags);
    const isIncludeTitle = metaTagsArray.some(
      meta => meta.getAttribute('name') === 'twitter:title' && meta.getAttribute('content') === title,
    );
    expect(isIncludeTitle).toBe(true);
    const isIncludeDesc = metaTagsArray.some(
      meta =>
        meta.getAttribute('name') === 'twitter:description' &&
        meta.getAttribute('content') === siteMetadata.description,
    );
    expect(isIncludeDesc).toBe(true);
    const isIncludeCreator = metaTagsArray.some(
      meta => meta.getAttribute('name') === 'twitter:creator' && meta.getAttribute('content') === siteMetadata.author,
    );
    expect(isIncludeCreator).toBe(true);
  });
});
