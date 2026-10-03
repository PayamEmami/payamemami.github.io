'use client';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import ReactMarkdown from 'react-markdown';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  CardItem,
  CardPageConfig,
} from '@/types/page';


const markdownComponents = {
  p: ({
    children,
  }: React.ComponentProps<'p'>) => (
    <p className="mb-3 last:mb-0">
      {children}
    </p>
  ),

  ul: ({
    children,
  }: React.ComponentProps<'ul'>) => (
    <ul className="list-disc list-inside mb-3 space-y-1">
      {children}
    </ul>
  ),

  ol: ({
    children,
  }: React.ComponentProps<'ol'>) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">
      {children}
    </ol>
  ),

  li: ({
    children,
  }: React.ComponentProps<'li'>) => (
    <li className="mb-1">
      {children}
    </li>
  ),

  a: ({
    ...props
  }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="
        text-accent
        font-medium
        hover:underline
      "
    />
  ),

  blockquote: ({
    children,
  }: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className="
        border-l-4
        border-accent/50
        pl-4
        italic
        my-4
        text-neutral-600
        dark:text-neutral-500
      "
    >
      {children}
    </blockquote>
  ),

  strong: ({
    children,
  }: React.ComponentProps<'strong'>) => (
    <strong className="font-semibold text-primary">
      {children}
    </strong>
  ),

  em: ({
    children,
  }: React.ComponentProps<'em'>) => (
    <em className="italic">
      {children}
    </em>
  ),

  code: ({
    children,
  }: React.ComponentProps<'code'>) => (
    <code
      className="
        px-1.5
        py-0.5
        rounded
        bg-neutral-100
        dark:bg-neutral-800
        text-[0.95em]
      "
    >
      {children}
    </code>
  ),
};


const groupDescriptions: Record<string, string> = {
  'Data Integration':
    'Methods for combining multiple data sources and omics layers.',

  'Dimensionality Reduction & Representation':
    'Methods for finding lower-dimensional structure and latent representations.',

  'Clustering & Community Detection':
    'Methods for identifying groups, density structure, and graph communities.',

  'Machine Learning':
    'Predictive modelling and ensemble learning methods.',

  'Explainable & Reliable ML':
    'Methods for understanding predictions and quantifying predictive uncertainty.',

  'Statistical Modelling':
    'Statistical models for structured, repeated, and correlated data.',
};


function isExternalLink(link: string) {
  if (!/^https?:\/\//i.test(link)) {
    return false;
  }

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


function groupToId(group: string) {
  return (
    'teaching-' +
    group
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}


export default function CardPage({
  config,
  embedded = false,
}: {
  config: CardPageConfig;
  embedded?: boolean;
}) {
  const [
    hoveredCard,
    setHoveredCard,
  ] = useState<string | null>(null);

  const [
    activeGroup,
    setActiveGroup,
  ] = useState<string | null>(null);

  const [
    showBackToTop,
    setShowBackToTop,
  ] = useState(false);


  /*
   * ------------------------------------------------------------
   * GROUP DATA
   * ------------------------------------------------------------
   */

  const hasGroups = useMemo(
    () =>
      config.items.some(
        (item) => Boolean(item.group)
      ),
    [config.items]
  );


  const groupOrder = useMemo(
    () =>
      Array.from(
        new Set(
          config.items.map(
            (item) =>
              item.group || 'Other'
          )
        )
      ),
    [config.items]
  );


  const groupedItems = useMemo(
    () =>
      config.items.reduce<
        Record<string, CardItem[]>
      >(
        (
          groups,
          item
        ) => {
          const group =
            item.group || 'Other';

          if (!groups[group]) {
            groups[group] = [];
          }

          groups[group].push(
            item
          );

          return groups;
        },
        {}
      ),
    [config.items]
  );


  /*
   * ------------------------------------------------------------
   * ACTIVE SECTION DETECTION
   * ------------------------------------------------------------
   *
   * We use a point about one third down the viewport.
   * Whichever teaching section occupies that point becomes active.
   */

  useEffect(() => {
    if (
      !hasGroups ||
      embedded ||
      groupOrder.length === 0
    ) {
      return;
    }

    let ticking = false;

    const updateActiveSection = () => {
      const targetY =
        window.innerHeight * 0.34;

      let bestGroup =
        groupOrder[0];

      let bestDistance =
        Number.POSITIVE_INFINITY;

      groupOrder.forEach(
        (group) => {
          const element =
            document.getElementById(
              groupToId(group)
            );

          if (!element) {
            return;
          }

          const rect =
            element.getBoundingClientRect();

          /*
           * If our target point is physically inside this section,
           * it wins immediately.
           */
          if (
            rect.top <= targetY &&
            rect.bottom >= targetY
          ) {
            bestGroup = group;
            bestDistance = 0;
            return;
          }

          /*
           * Otherwise choose whichever section edge is closest.
           */
          const distance =
            Math.min(
              Math.abs(
                rect.top - targetY
              ),
              Math.abs(
                rect.bottom - targetY
              )
            );

          if (
            distance <
            bestDistance
          ) {
            bestDistance =
              distance;

            bestGroup =
              group;
          }
        }
      );

      setActiveGroup(
        bestGroup || null
      );

      setShowBackToTop(
        window.scrollY > 500
      );

      ticking = false;
    };


    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;

      window.requestAnimationFrame(
        updateActiveSection
      );
    };


    updateActiveSection();

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      handleScroll
    );


    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        handleScroll
      );
    };
  }, [
    embedded,
    groupOrder,
    hasGroups,
  ]);


  /*
   * ------------------------------------------------------------
   * SCROLL HELPERS
   * ------------------------------------------------------------
   */

  function scrollToGroup(
    group: string
  ) {
    const element =
      document.getElementById(
        groupToId(group)
      );

    if (!element) {
      return;
    }

    setActiveGroup(group);

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }


  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  /*
   * ------------------------------------------------------------
   * CARD BODY
   * ------------------------------------------------------------
   */

  const renderCardBody = (
    item: CardItem
  ) => (
    <>
      <div
        className="
          flex
          justify-between
          items-start
          gap-4
          mb-2
        "
      >
        <h3
          className={`
            ${
              embedded
                ? 'text-lg'
                : 'text-xl'
            }

            font-semibold
            text-primary

            transition-transform
            duration-300

            group-hover:translate-x-1
          `}
        >
          {item.title}
        </h3>


        <div
          className="
            flex
            items-center
            gap-3
            shrink-0
          "
        >
          {item.date && (
            <span
              className="
                text-sm
                text-neutral-500
                font-medium

                bg-neutral-100
                dark:bg-neutral-800

                px-2
                py-1
                rounded
              "
            >
              {item.date}
            </span>
          )}


          {item.link && (
            <span
              aria-hidden="true"
              className="
                text-xl
                text-accent

                transition-all
                duration-300

                group-hover:translate-x-1
                group-hover:scale-110
              "
            >
              {
                isExternalLink(
                  item.link
                )
                  ? '↗'
                  : '→'
              }
            </span>
          )}
        </div>
      </div>


      {item.subtitle && (
        <p
          className={`
            ${
              embedded
                ? 'text-sm'
                : 'text-base'
            }

            text-accent
            font-medium
            mb-3
          `}
        >
          {item.subtitle}
        </p>
      )}


      {item.content && (
        <div
          className={`
            ${
              embedded
                ? 'text-sm'
                : 'text-base'
            }

            text-neutral-600
            dark:text-neutral-400

            leading-relaxed
          `}
        >
          <ReactMarkdown
            components={
              markdownComponents
            }
          >
            {item.content}
          </ReactMarkdown>
        </div>
      )}


      {item.tags && (
        <div
          className="
            flex
            flex-wrap
            gap-2
            mt-5
          "
        >
          {item.tags.map(
            (tag) => (
              <span
                key={tag}
                className="
                  text-xs
                  text-neutral-500

                  bg-neutral-50
                  dark:bg-neutral-800/60

                  px-2.5
                  py-1

                  rounded-full

                  border
                  border-neutral-100
                  dark:border-neutral-800

                  transition-colors
                  duration-300

                  group-hover:border-neutral-300
                  dark:group-hover:border-neutral-700
                "
              >
                {tag}
              </span>
            )
          )}
        </div>
      )}
    </>
  );


  /*
   * ------------------------------------------------------------
   * INDIVIDUAL CARD
   * ------------------------------------------------------------
   */

  const renderCard = (
    item: CardItem,
    index: number,
    scope: string
  ) => {
    const external =
      item.link
        ? isExternalLink(
            item.link
          )
        : false;

    const cardKey =
      `${scope}-${index}-${item.title}`;

    const card = (
      <div
        className={`
          group

          relative
          z-10

          h-full

          ${
            embedded
              ? 'p-4'
              : 'p-6'
          }

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

          ${
            item.link
              ? 'cursor-pointer'
              : ''
          }
        `}
      >
        {renderCardBody(
          item
        )}
      </div>
    );


    return (
      <motion.div
        key={cardKey}

        initial={{
          opacity: 0,
          y: 16,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.4,
          delay:
            0.04 * index,
        }}

        onMouseEnter={() =>
          setHoveredCard(
            cardKey
          )
        }

        className="
          relative
          p-2
          rounded-2xl
          h-full
        "
      >
        {/*
         * MOVING ACETERNITY-STYLE BACKGROUND
         */}

        <AnimatePresence>
          {
            hoveredCard ===
              cardKey && (
              <motion.div
                layoutId={
                  `card-hover-background-${scope}`
                }

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
            )
          }
        </AnimatePresence>


        {item.link ? (
          <a
            href={
              item.link
            }

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

            className="
              relative
              block
              h-full
            "
          >
            {card}
          </a>
        ) : (
          <div
            className="
              relative
              h-full
            "
          >
            {card}
          </div>
        )}
      </motion.div>
    );
  };


  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.6,
          delay: 0.2,
        }}
      >
        {/* PAGE HEADING */}

        <div
          className={
            embedded
              ? 'mb-6'
              : 'mb-12'
          }
        >
          <h1
            className={`
              ${
                embedded
                  ? 'text-2xl'
                  : 'text-4xl'
              }

              font-serif
              font-bold

              text-primary
              mb-4
            `}
          >
            {config.title}
          </h1>


          {config.description && (
            <div
              className={`
                ${
                  embedded
                    ? 'text-base'
                    : 'text-lg'
                }

                text-neutral-600
                dark:text-neutral-500

                max-w-3xl
                leading-relaxed
              `}
            >
              <ReactMarkdown
                components={
                  markdownComponents
                }
              >
                {
                  config.description
                }
              </ReactMarkdown>
            </div>
          )}
        </div>


        {/*
         * ========================================================
         * GROUPED VIEW
         * ========================================================
         */}

        {hasGroups ? (
          <div
            className="
              space-y-[clamp(3rem,6vw,6rem)]
            "
          >
            {groupOrder.map(
              (
                group,
                groupIndex
              ) => {
                const items =
                  groupedItems[
                    group
                  ] || [];

                const description =
                  groupDescriptions[
                    group
                  ];

                const number =
                  String(
                    groupIndex + 1
                  ).padStart(
                    2,
                    '0'
                  );

                return (
                  <motion.section
                    key={group}

                    id={
                      groupToId(
                        group
                      )
                    }

                    initial={{
                      opacity: 0,
                      y: 24,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      duration: 0.5,
                      delay:
                        0.08 *
                        groupIndex,
                    }}

                    className="
                      relative

                      scroll-mt-28

                      rounded-3xl

                      border
                      border-neutral-200/70
                      dark:border-neutral-800/70

                      bg-neutral-50/40
                      dark:bg-neutral-900/20

                      p-[clamp(1rem,2.2vw,2rem)]

                      overflow-hidden
                    "
                  >
                    {/*
                     * SUBTLE CATEGORY GLOW
                     */}

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none

                        absolute
                        -top-24
                        -left-24

                        w-72
                        h-72

                        rounded-full

                        bg-accent/5

                        blur-3xl
                      "
                    />


                    {/*
                     * CATEGORY HEADER
                     */}

                    <div
                      className="
                        relative
                        z-10

                        mb-7
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                          mb-3
                        "
                      >
                        <span
                          className="
                            font-mono
                            text-xs
                            tracking-[0.2em]

                            text-accent
                            font-semibold
                          "
                        >
                          {number}
                        </span>


                        <div
                          className="
                            h-px
                            flex-1

                            bg-gradient-to-r

                            from-neutral-300
                            dark:from-neutral-700

                            to-transparent
                          "
                        />


                        <span
                          className="
                            text-xs
                            text-neutral-500

                            border
                            border-neutral-200
                            dark:border-neutral-700

                            rounded-full

                            px-3
                            py-1
                          "
                        >
                          {items.length}{' '}
                          {
                            items.length ===
                            1
                              ? 'tutorial'
                              : 'tutorials'
                          }
                        </span>
                      </div>


                      <h2
                        className="
                          text-[clamp(1.35rem,2vw,2rem)]

                          font-serif
                          font-bold

                          text-primary

                          tracking-tight
                        "
                      >
                        {group}
                      </h2>


                      {description && (
                        <p
                          className="
                            mt-2

                            text-sm
                            sm:text-base

                            text-neutral-500
                            dark:text-neutral-400

                            max-w-3xl

                            leading-relaxed
                          "
                        >
                          {
                            description
                          }
                        </p>
                      )}
                    </div>


                    {/*
                     * TWO-COLUMN TUTORIAL GRID
                     */}

                    <div
                      className="
                        relative
                        z-10

                        grid
                        grid-cols-1
                        md:grid-cols-2

                        gap-3
                      "

                      onMouseLeave={() =>
                        setHoveredCard(
                          null
                        )
                      }
                    >
                      {items.map(
                        (
                          item,
                          index
                        ) =>
                          renderCard(
                            item,
                            index,
                            `group-${groupIndex}`
                          )
                      )}
                    </div>
                  </motion.section>
                );
              }
            )}
          </div>
        ) : (

          /*
           * ======================================================
           * NORMAL CARD VIEW
           * ======================================================
           *
           * Tools and other card pages remain unchanged.
           */

          <div
            className={`
              grid

              ${
                embedded
                  ? 'gap-2'
                  : 'gap-3'
              }
            `}

            onMouseLeave={() =>
              setHoveredCard(
                null
              )
            }
          >
            {config.items.map(
              (
                item,
                index
              ) =>
                renderCard(
                  item,
                  index,
                  'default'
                )
            )}
          </div>
        )}
      </motion.div>


      {/*
       * ==========================================================
       * RIGHT-SIDE SECTION NAVIGATOR
       * ==========================================================
       *
       * Desktop only.
       *
       * It is shown only on grouped standalone pages, so Tools and
       * embedded card pages are unaffected.
       */}

      {
        hasGroups &&
        !embedded && (
          <aside
            aria-label="Teaching sections"

            className="
              fixed

              right-5
              2xl:right-8

              top-1/2
              -translate-y-1/2

              z-40

              hidden
              xl:block
            "
          >
            <div
              className="
                relative

                flex
                flex-col
                items-center

                gap-2

                p-2

                rounded-full

                border
                border-neutral-200/80
                dark:border-neutral-700/80

                bg-white/75
                dark:bg-neutral-950/75

                backdrop-blur-xl

                shadow-xl
                shadow-black/5
                dark:shadow-black/30
              "
            >
              {/*
               * Vertical guide line
               */}

              <div
                aria-hidden="true"
                className="
                  absolute

                  top-6
                  bottom-6

                  left-1/2
                  -translate-x-1/2

                  w-px

                  bg-neutral-200
                  dark:bg-neutral-800
                "
              />


              {groupOrder.map(
                (
                  group,
                  index
                ) => {
                  const active =
                    activeGroup ===
                    group;

                  const number =
                    String(
                      index + 1
                    ).padStart(
                      2,
                      '0'
                    );

                  return (
                    <button
                      key={group}

                      type="button"

                      aria-label={
                        `Go to ${group}`
                      }

                      aria-current={
                        active
                          ? 'true'
                          : undefined
                      }

                      onClick={() =>
                        scrollToGroup(
                          group
                        )
                      }

                      className="
                        group

                        relative
                        z-10

                        flex
                        items-center
                        justify-center

                        w-9
                        h-9

                        rounded-full

                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-accent
                        focus-visible:ring-offset-2

                        transition-transform
                        duration-200

                        hover:scale-110
                      "
                    >
                      {/*
                       * Tooltip / section name
                       */}

                      <span
                        className="
                          pointer-events-none

                          absolute

                          right-full
                          mr-3

                          whitespace-nowrap

                          rounded-xl

                          border
                          border-neutral-200
                          dark:border-neutral-700

                          bg-white/95
                          dark:bg-neutral-950/95

                          backdrop-blur-xl

                          px-3
                          py-2

                          text-xs
                          font-medium

                          text-neutral-700
                          dark:text-neutral-200

                          shadow-lg

                          opacity-0
                          translate-x-2

                          transition-all
                          duration-200

                          group-hover:opacity-100
                          group-hover:translate-x-0
                        "
                      >
                        {group}
                      </span>


                      {/*
                       * Number circle
                       */}

                      <span
                        className={`
                          relative
                          z-10

                          flex
                          items-center
                          justify-center

                          w-9
                          h-9

                          rounded-full

                          font-mono
                          text-[10px]
                          font-semibold

                          border

                          transition-all
                          duration-300

                          ${
                            active
                              ? `
                                bg-accent
                                text-white
                                border-accent

                                shadow-lg
                                shadow-accent/20

                                scale-110
                              `
                              : `
                                bg-white
                                dark:bg-neutral-950

                                text-neutral-500
                                dark:text-neutral-400

                                border-neutral-200
                                dark:border-neutral-700

                                hover:text-primary
                                hover:border-neutral-400
                                dark:hover:border-neutral-500
                              `
                          }
                        `}
                      >
                        {number}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </aside>
        )
      }


      {/*
       * ==========================================================
       * BACK TO TOP
       * ==========================================================
       */}

      <AnimatePresence>
        {
          hasGroups &&
          !embedded &&
          showBackToTop && (
            <motion.button
              type="button"

              aria-label="Back to top"

              onClick={
                scrollToTop
              }

              initial={{
                opacity: 0,
                y: 12,
                scale: 0.9,
              }}

              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}

              exit={{
                opacity: 0,
                y: 12,
                scale: 0.9,
              }}

              whileHover={{
                y: -3,
              }}

              whileTap={{
                scale: 0.94,
              }}

              transition={{
                duration: 0.2,
              }}

              className="
                fixed

                right-5
                bottom-5

                sm:right-6
                sm:bottom-6

                z-50

                flex
                items-center
                justify-center

                w-11
                h-11

                rounded-full

                border
                border-neutral-200/80
                dark:border-neutral-700/80

                bg-white/85
                dark:bg-neutral-950/85

                backdrop-blur-xl

                text-lg
                text-primary

                shadow-xl
                shadow-black/10
                dark:shadow-black/30

                cursor-pointer

                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent
                focus-visible:ring-offset-2
              "
            >
              ↑
            </motion.button>
          )
        }
      </AnimatePresence>
    </>
  );
}