import React from 'react';
import styled from 'styled-components';

const PostWrapper = styled.div`
  margin: 0 auto;
  width: 768px;
  position: relative;
`;

const PostHeader = styled.div``;

const PostContentWrapper = styled.div`
  width: 80%;
  margin: 0 auto;
`;

interface PostProps {
  title: string;
  date: any;
  html: string;
}

const Post: React.FC<PostProps> = ({ title, date, html }) => (
  <PostWrapper>
    <PostHeader>
      <h1>{title}</h1>
      <h2>{date}</h2>
    </PostHeader>
    <PostContentWrapper dangerouslySetInnerHTML={{ __html: html }} />
  </PostWrapper>
);

export default Post;
