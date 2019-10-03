import React from 'react';
import { render } from '@testing-library/react';

import BlogPost from '../BlogPost';

describe(`Blog Post`, () => {
  it(`renders Blog Post`, () => {
    const postTitle = `Hello World`;
    const { getByText } = render(<BlogPost title={postTitle} date={new Date().getFullYear()} html="" />);

    const title = getByText(postTitle);

    expect(title).toBeInTheDocument();
  });
});
