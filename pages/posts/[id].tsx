import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import { GetStaticProps } from 'next';

export const getStaticPaths = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export type StaticProps = {
  params: {
    id: string;
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
}: StaticProps) => {
  const postData = getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
};

const Post = ({ postData }) => (
  <Layout home={false}>
    {postData.data.title}
    <br />
    {postData.id}
    <br />
    {postData.data.date}
  </Layout>
);

export default Post;
