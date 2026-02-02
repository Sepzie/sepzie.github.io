import React from 'react';
import { GatsbyImage } from 'gatsby-plugin-image';
import { Animation } from 'gatsby-theme-portfolio-minimal/src/components/Animation';
import { Icon } from 'gatsby-theme-portfolio-minimal/src/components/Icon';
import { useMediaQuery } from 'gatsby-theme-portfolio-minimal/src/hooks/useMediaQuery';
import { ImageObject } from 'gatsby-theme-portfolio-minimal/src/types';
import * as classes from './style.module.css';

enum LinkType {
    External = 'external',
    Github = 'github',
}

export interface Project {
    category?: string;
    title: string;
    description: string;
    image: ImageObject & { linkTo?: string };
    tags?: string[];
    links?: {
        type: LinkType;
        url: string;
    }[];
    visible: boolean;
    date?: string;
}

interface ProjectProps {
    data: Project;
    index: number;
}

function formatProjectDate(value?: string): string | null {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
        const parsed = Date.parse(`${trimmed}-01T00:00:00Z`);
        if (Number.isNaN(parsed)) {
            return null;
        }
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            year: 'numeric',
        }).format(new Date(parsed));
    }
    return trimmed;
}

export function Project(props: ProjectProps): React.ReactElement {
    const isDesktopBreakpoint = useMediaQuery('(min-width: 992px)');
    const dateLabel = formatProjectDate(props.data.date);
    const imageSource = props.data.image.src as
        | {
              childImageSharp?: {
                  gatsbyImageData?: import('gatsby-plugin-image').IGatsbyImageData;
              };
              publicURL?: string;
          }
        | null;
    const gatsbyImageData = imageSource?.childImageSharp?.gatsbyImageData;
    const fallbackUrl = imageSource?.publicURL;
    const imageAlt = props.data.image.alt || `Project ${props.data.title}`;
    const imageElement = gatsbyImageData ? (
        <GatsbyImage
            className={classes.ProjectImageWrapper}
            imgClassName={classes.ProjectImage}
            objectFit={props.data.image.objectFit}
            image={gatsbyImageData}
            alt={imageAlt}
        />
    ) : fallbackUrl ? (
        <div className={classes.ProjectImageWrapper}>
            <img
                className={classes.ProjectImage}
                src={fallbackUrl}
                alt={imageAlt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: props.data.image.objectFit ?? 'cover',
                }}
                loading="lazy"
            />
        </div>
    ) : null;

    return (
        <Animation
            type="fadeUp"
            className={classes.Project}
            style={{
                flexDirection: isDesktopBreakpoint && props.index % 2 === 0 ? 'row-reverse' : undefined,
            }}
        >
            <div className={classes.Details}>
                {(props.data.category || dateLabel) && (
                    <div className={classes.Meta}>
                        {props.data.category && <span className={classes.Category}>{props.data.category}</span>}
                        {dateLabel && <span className={classes.Date}>{dateLabel}</span>}
                    </div>
                )}
                <h4 className={classes.Title}>{props.data.title}</h4>
                <p>{props.data.description}</p>
                <div className={classes.Tags}>
                    {props.data.tags &&
                        props.data.tags.length !== 0 &&
                        props.data.tags.map((tag, key) => {
                            return (
                                <span key={key}>
                                    <u>{tag}</u>
                                </span>
                            );
                        })}
                </div>
                <div className={classes.Links}>
                    {props.data.links &&
                        props.data.links.length !== 0 &&
                        props.data.links.map((link, key) => {
                            return (
                                <a
                                    key={key}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="External Link"
                                >
                                    <Icon name={link.type} color="var(--subtext-color)" />
                                </a>
                            );
                        })}
                </div>
            </div>
            {imageElement && props.data.image.linkTo && (
                <a href={props.data.image.linkTo} target="_blank" rel="noopener noreferrer" aria-label="External Link">
                    {imageElement}
                </a>
            )}
            {imageElement && !props.data.image.linkTo && imageElement}
        </Animation>
    );
}
