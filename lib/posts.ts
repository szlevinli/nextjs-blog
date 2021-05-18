import { sort } from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import {
  apS,
  bind,
  bindTo,
  chain,
  Do,
  flap,
  flatten,
  IO,
  map,
  of,
  traverseArray,
} from 'fp-ts/IO';
import { contramap as contramapOrd, reverse } from 'fp-ts/Ord';
import { Ord as strOrd } from 'fp-ts/string';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import R from 'ramda';

export type PostsData = matter.GrayMatterFile<string> & { id: string };

//
// defined
//

const getCwd = of(process.cwd());

const getFileName = (ext: RegExp) => (fileName: string) =>
  of(fileName.replace(ext, ''));
const getFileNameForMdFile = getFileName(/\.md$/);

const getFullPath = (dirPath: string) => (filePath: string) =>
  of(path.join(dirPath, filePath));

const getFileNamesOfDir = (dir: string) => of(fs.readdirSync(dir));

const getFileContents = (file: string) => of(fs.readFileSync(file, 'utf-8'));

const getMatter = (fileContent: string) => of(matter(fileContent));

const sortByDate = pipe(
  strOrd,
  reverse,
  contramapOrd((p: PostsData) => p.data.date)
);

//
// usage
//

// const getFullPathForPosts = getFullPath(process.cwd())('posts');
const getFullPathForPosts = pipe(
  getCwd,
  map(getFullPath),
  flap('posts'),
  flatten
);

const getFullPathFileNameForPosts = (fileName: string) =>
  pipe(getFullPathForPosts, map(getFullPath), flap(fileName), flatten);

const fileNameToMatter = (fileName: string): IO<PostsData> =>
  pipe(
    getFullPathFileNameForPosts(fileName),
    chain(getFileContents),
    chain(getMatter),
    apS('id', getFileNameForMdFile(fileName))
  );

const getFileNamesForPosts = pipe(
  getFullPathForPosts,
  chain(getFileNamesOfDir)
);

const fileNameToId = (fileName: string) =>
  pipe(
    Do,
    bind('id', () => getFileNameForMdFile(fileName)),
    bindTo('params')
  );

//
// exports
//

export const getSortedPostsData = pipe(
  getFileNamesForPosts,
  chain(traverseArray(fileNameToMatter)),
  map(sort(sortByDate))
);

export const getAllPostIds: IO<readonly { params: { readonly id: string } }[]> =
  pipe(getFileNamesForPosts, chain(traverseArray(fileNameToId)));

export const getPostData = (id: string) =>
  pipe(
    getFullPathFileNameForPosts(`${id}.md`),
    chain(getFileContents),
    chain(getMatter),
    map(R.pick(['data'])),
    bind('id', () => () => id)
  )();
