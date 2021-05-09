import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useState } from 'react';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(() =>
    postsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          parseISO(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    })
  );
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleNexPage = useCallback(async () => {
    const response = await fetch(nextPage);
    const data = await response.json();
    const formattedPosts = data.results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: format(
          parseISO(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts(state => [...state, ...formattedPosts]);
    setNextPage(data.next_page);
  }, [nextPage]);

  return (
    <>
      <Head>
        <title>Home | SpaceTravelling</title>
      </Head>
      <Header type="large" />
      <main>
        <section className={styles.content}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <article className={styles.postArticle}>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div>
                    <div>
                      <FiCalendar color="#D7D7D7" />
                      <time>{post.first_publication_date}</time>
                    </div>
                    <div>
                      <FiUser color="#D7D7D7" />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </article>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.loadMore}
              onClick={handleNexPage}
            >
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
