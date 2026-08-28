'use client';

import ScientificParticleField from '@/components/home/ScientificParticleField';
import Profile from '@/components/home/Profile';
import About from '@/components/home/About';
import SelectedPublications from '@/components/home/SelectedPublications';
import News, { NewsItem } from '@/components/home/News';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import type { SiteConfig } from '@/lib/config';
import { Publication } from '@/types/publication';
import {
  CardPageConfig,
  PublicationPageConfig,
  TextPageConfig,
} from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
}

type PageData =
  | {
      type: 'about';
      id: string;
      sections: SectionConfig[];
    }
  | {
      type: 'publication';
      id: string;
      config: PublicationPageConfig;
      publications: Publication[];
    }
  | {
      type: 'text';
      id: string;
      config: TextPageConfig;
      content: string;
    }
  | {
      type: 'card';
      id: string;
      config: CardPageConfig;
    };

export interface HomePageLocaleData {
  author: SiteConfig['author'];
  social: SiteConfig['social'];
  features: SiteConfig['features'];
  enableOnePageMode?: boolean;
  researchInterests?: string[];
  pagesToShow: PageData[];
}

interface HomePageClientProps {
  dataByLocale: Record<string, HomePageLocaleData>;
  defaultLocale: string;
}

export default function HomePageClient({
  dataByLocale,
  defaultLocale,
}: HomePageClientProps) {
  const locale = useLocaleStore((state) => state.locale);

  const fallback =
    dataByLocale[defaultLocale] ||
    Object.values(dataByLocale)[0];

  const data = dataByLocale[locale] || fallback;

  if (!data) {
    return null;
  }

  return (
    <div
      className="
        relative
        w-full
        max-w-[clamp(72rem,90vw,120rem)]
        mx-auto

        px-[clamp(1rem,3vw,4rem)]
        py-[clamp(2rem,4vh,5rem)]

        bg-background
        min-h-screen
        overflow-hidden
      "
    >
      {/* Interactive PCA / omics-style particle background */}
      <ScientificParticleField />

      {/* Main homepage content sits above the animation */}
      <div className="relative z-10">

        {/*
         * Fluid desktop layout:
         *
         * - On phones/tablets: one column
         * - On desktop: profile gets a sensible minimum width
         * - Main content expands and absorbs the available space
         * - Gap scales continuously with screen size
         */}
        <div
          className="
            grid
            grid-cols-1

            lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2.2fr)]

            gap-[clamp(2rem,4vw,6rem)]
          "
        >
          {/* LEFT: PROFILE */}
          <div className="min-w-0">
            <Profile
              author={data.author}
              social={data.social}
              features={data.features}
              researchInterests={data.researchInterests}
            />
          </div>

          {/* RIGHT: MAIN CONTENT */}
          <div
            className="
              min-w-0
              space-y-[clamp(2rem,4vw,4rem)]
            "
          >
            {data.pagesToShow.map((page) => (
              <section
                key={page.id}
                id={page.id}
                className="
                  scroll-mt-24
                  space-y-[clamp(2rem,3vw,4rem)]
                "
              >
                {/* ABOUT PAGE SECTIONS */}
                {page.type === 'about' &&
                  page.sections.map(
                    (section: SectionConfig) => {
                      switch (section.type) {
                        case 'markdown':
                          return (
                            <About
                              key={section.id}
                              content={
                                section.content || ''
                              }
                              title={section.title}
                            />
                          );

                        case 'publications':
                          return (
                            <SelectedPublications
                              key={section.id}
                              publications={
                                section.publications || []
                              }
                              title={section.title}
                              enableOnePageMode={
                                data.enableOnePageMode
                              }
                            />
                          );

                        case 'list':
                          return (
                            <News
                              key={section.id}
                              items={
                                section.items || []
                              }
                              title={section.title}
                            />
                          );

                        default:
                          return null;
                      }
                    }
                  )}

                {/* PUBLICATIONS PAGE */}
                {page.type === 'publication' && (
                  <PublicationsList
                    config={page.config}
                    publications={
                      page.publications
                    }
                    embedded={true}
                  />
                )}

                {/* TEXT PAGE */}
                {page.type === 'text' && (
                  <TextPage
                    config={page.config}
                    content={page.content}
                    embedded={true}
                  />
                )}

                {/* CARD PAGE */}
                {page.type === 'card' && (
                  <CardPage
                    config={page.config}
                    embedded={true}
                  />
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}