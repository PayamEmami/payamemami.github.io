'use client';

import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import React, { useState } from 'react';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
  p: ({ children }: React.ComponentProps<'p'>) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),

  ul: ({ children }: React.ComponentProps<'ul'>) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),

  ol: ({ children }: React.ComponentProps<'ol'>) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),

  li: ({ children }: React.ComponentProps<'li'>) => (
    <li className="mb-1">{children}</li>
  ),

  a: ({ ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent font-medium hover:underline"
    />
  ),

  blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
    <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
      {children}
    </blockquote>
  ),

  strong: ({ children }: React.ComponentProps<'strong'>) => (
    <strong className="font-semibold text-primary">{children}</strong>
  ),

  em: ({ children }: React.ComponentProps<'em'>) => (
    <em className="italic">{children}</em>
  ),

  code: ({ children }: React.ComponentProps<'code'>) => (
    <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">
      {children}
    </code>
  ),
};

function isExternalLink(link: string) {
  if (!/^https?:\/\//i.test(link)) return false;

  try {
    const url = new URL(link);

    return (
      url.hostname !== 'payamemami.com' &&
      url.hostname !== 'www.payamemami.com'
    );
  } catch {
    return false;
  }
}

export default function CardPage({
  config,
  embedded = false,
}: {
  config: CardPageConfig;
  embedded?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const renderCardBody = (
    item: CardPageConfig['items'][number]
  ) => (
    <>
      <div className="flex justify-between items-start gap-4 mb-2">

        <h3
          className={`
            ${embedded ? 'text-lg' : 'text-xl'}
            font-semibold text-primary
            transition-transform duration-300
            group-hover:translate-x-1
          `}
        >
          {item.title}
        </h3>

        <div className="flex items-center gap-3 shrink-0">

          {item.date && (
            <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
              {item.date}
            </span>
          )}

          {item.link && (
            <span
              aria-hidden="true"
              className="
                text-xl text-accent
                transition-all duration-300
                group-hover:translate-x-1
                group-hover:scale-110
              "
            >
              {isExternalLink(item.link) ? '↗' : '→'}
            </span>
          )}

        </div>
      </div>

      {item.subtitle && (
        <p
          className={`
            ${embedded ? 'text-sm' : 'text-base'}
            text-accent font-medium mb-3
          `}
        >
          {item.subtitle}
        </p>
      )}

      {item.content && (
        <div
          className={`
            ${embedded ? 'text-sm' : 'text-base'}
            text-neutral-600 dark:text-neutral-400
            leading-relaxed
          `}
        >
          <ReactMarkdown components={markdownComponents}>
            {item.content}
          </ReactMarkdown>
        </div>
      )}

      {item.tags && (
        <div className="flex flex-wrap gap-2 mt-5">

          {item.tags.map((tag) => (
            <span
              key={tag}
              className="
                text-xs text-neutral-500
                bg-neutral-50 dark:bg-neutral-800/60
                px-2.5 py-1
                rounded-full
                border border-neutral-100 dark:border-neutral-800
                transition-colors duration-300
                group-hover:border-neutral-300
                dark:group-hover:border-neutral-700
              "
            >
              {tag}
            </span>
          ))}

        </div>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >

      {/* PAGE HEADING */}

      <div className={embedded ? 'mb-4' : 'mb-10'}>

        <h1
          className={`
            ${embedded ? 'text-2xl' : 'text-4xl'}
            font-serif font-bold
            text-primary mb-4
          `}
        >
          {config.title}
        </h1>

        {config.description && (
          <div
            className={`
              ${embedded ? 'text-base' : 'text-lg'}
              text-neutral-600 dark:text-neutral-500
              max-w-2xl leading-relaxed
            `}
          >
            <ReactMarkdown components={markdownComponents}>
              {config.description}
            </ReactMarkdown>
          </div>
        )}

      </div>

      {/* CARDS */}

      <div
        className={`grid ${embedded ? 'gap-2' : 'gap-3'}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >

        {config.items.map((item, index) => {

          const external =
            item.link ? isExternalLink(item.link) : false;

          const card = (

            <div
              className={`
                group
                relative z-10
                h-full
                ${embedded ? 'p-4' : 'p-6'}

                rounded-xl

                bg-white
                dark:bg-neutral-950

                border
                border-neutral-200/80
                dark:border-neutral-800

                shadow-sm

                transition-all
                duration-300

                hover:border-transparent
                dark:hover:border-transparent

                ${item.link ? 'cursor-pointer' : ''}
              `}
            >
              {renderCardBody(item)}
            </div>

          );

          return (

            <motion.div
              key={index}

              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}

              transition={{
                duration: 0.4,
                delay: 0.06 * index,
              }}

              onMouseEnter={() => setHoveredIndex(index)}

              className="
                relative
                p-2
                rounded-2xl
              "
            >

              {/* MOVING HOVER BACKGROUND */}

              <AnimatePresence>

                {hoveredIndex === index && (

                  <motion.div
                    layoutId="card-hover-background"

                    className="
                      absolute
                      inset-0

                      rounded-2xl

                      bg-neutral-200/80
                      dark:bg-neutral-800/80

                      shadow-lg
                      dark:shadow-black/30
                    "

                    initial={{
                      opacity: 0,
                      scale: 0.96,
                    }}

                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}

                    exit={{
                      opacity: 0,
                      scale: 0.96,
                    }}

                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />

                )}

              </AnimatePresence>


              {/* CLICKABLE CARD */}

              {item.link ? (

                <a
                  href={item.link}

                  target={
                    external
                      ? '_blank'
                      : undefined
                  }

                  rel={
                    external
                      ? 'noopener noreferrer'
                      : undefined
                  }

                  className="relative block h-full"
                >
                  {card}
                </a>

              ) : (

                <div className="relative h-full">
                  {card}
                </div>

              )}

            </motion.div>

          );

        })}

      </div>

    </motion.div>
  );
}