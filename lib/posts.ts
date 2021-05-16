import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type PostsData = matter.GrayMatterFile<string> & { id: string };

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData(): PostsData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');

    const matterResult = matter(fileContents);

    return {
      id,
      ...matterResult,
    };
  });

  return allPostsData.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}
