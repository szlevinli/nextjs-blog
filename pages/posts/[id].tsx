import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData } from '../../lib/posts';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import utilStyles from '../../styles/utils.module.css';

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
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
};

const Post = ({ postData }) => (
  <Layout home={false}>
    <Head>
      <title>{postData.data.title}</title>
    </Head>
    <article>
      <h1 className={utilStyles.headingXl}>{postData.data.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={postData.data.date} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
    </article>
  </Layout>
);

export default Post;
