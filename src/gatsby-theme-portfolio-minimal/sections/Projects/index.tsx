import React from 'react';
import { Animation } from 'gatsby-theme-portfolio-minimal/src/components/Animation';
import { Button, ButtonType } from 'gatsby-theme-portfolio-minimal/src/components/Button';
import { Project } from 'gatsby-theme-portfolio-minimal/src/components/Project';
import { Section } from 'gatsby-theme-portfolio-minimal/src/components/Section';
import { Slider } from 'gatsby-theme-portfolio-minimal/src/components/Slider';
import { PageSection } from 'gatsby-theme-portfolio-minimal/src/types';
import projectsContent from '../../../../content/sections/projects/projects.json';
import { useLocalDataSource } from './data';
import * as classes from './style.module.css';

function normalizeTag(value: string): string {
    return value.trim().toLowerCase();
}

function parseProjectDate(value?: string): number | null {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
        const parsed = Date.parse(`${trimmed}-01T00:00:00Z`);
        return Number.isNaN(parsed) ? null : parsed;
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
}

export function ProjectsSection(props: PageSection): React.ReactElement {
    const response = useLocalDataSource();
    const data = response.allProjectsJson.sections[0];
    const projects = React.useMemo(() => data.projects.filter((project) => project.visible), [data.projects]);
    const [activeTag, setActiveTag] = React.useState<string | null>(null);

    const dateLookup = React.useMemo(() => {
        const lookup = new Map<string, string>();
        (projectsContent?.projects ?? []).forEach((project: { title?: string; date?: string }) => {
            if (!project?.title) {
                return;
            }
            lookup.set(project.title, project.date ?? '');
        });
        return lookup;
    }, []);

    const sortedProjects = React.useMemo(() => {
        const projectsWithDates = projects.map((project, index) => ({
            ...project,
            date: dateLookup.get(project.title),
            _index: index,
        }));
        return projectsWithDates.sort((a, b) => {
            const aTime = parseProjectDate(a.date);
            const bTime = parseProjectDate(b.date);
            if (aTime !== null && bTime !== null) {
                return bTime - aTime;
            }
            if (aTime !== null) {
                return -1;
            }
            if (bTime !== null) {
                return 1;
            }
            return a._index - b._index;
        });
    }, [projects, dateLookup]);

    const availableTags = React.useMemo(() => {
        const tagMap = new Map<string, string>();
        sortedProjects.forEach((project) => {
            project.tags?.forEach((tag) => {
                const normalized = normalizeTag(tag);
                if (!tagMap.has(normalized)) {
                    tagMap.set(normalized, tag);
                }
            });
        });
        return Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b));
    }, [sortedProjects]);

    const normalizedActiveTag = activeTag ? normalizeTag(activeTag) : null;
    const filteredProjects = React.useMemo(() => {
        if (!normalizedActiveTag) {
            return sortedProjects;
        }
        return sortedProjects.filter((project) =>
            project.tags?.some((tag) => normalizeTag(tag) === normalizedActiveTag),
        );
    }, [sortedProjects, normalizedActiveTag]);

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<{ skill?: string }>;
            const skill = customEvent.detail?.skill;
            if (typeof skill === 'string' && skill.trim().length > 0) {
                setActiveTag(skill);
            }
        };
        window.addEventListener('portfolio-skill-filter', handler);
        return () => {
            window.removeEventListener('portfolio-skill-filter', handler);
        };
    }, []);

    function handleFilterClick(tag: string | null) {
        setActiveTag((current) => {
            if (!tag) {
                return null;
            }
            return current && normalizeTag(current) === normalizeTag(tag) ? null : tag;
        });
    }

    return (
        <Animation type="fadeIn">
            <Section anchor={props.sectionId} heading={props.heading}>
                {availableTags.length > 0 && (
                    <div className={classes.FilterWrapper}>
                        <p className={classes.FilterLabel}>Filter by skill</p>
                        <div className={classes.Filters}>
                            <button
                                type="button"
                                className={`${classes.FilterButton} ${
                                    activeTag === null ? classes.FilterButtonActive : ''
                                }`}
                                onClick={() => handleFilterClick(null)}
                                aria-pressed={activeTag === null}
                            >
                                All
                            </button>
                            {availableTags.map((tag) => {
                                const isActive =
                                    activeTag !== null && normalizeTag(activeTag) === normalizeTag(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`${classes.FilterButton} ${
                                            isActive ? classes.FilterButtonActive : ''
                                        }`}
                                        onClick={() => handleFilterClick(tag)}
                                        aria-pressed={isActive}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <Slider additionalClasses={[classes.Projects]}>
                    {filteredProjects.map((project, key) => {
                        return <Project key={`${project.title}-${key}`} index={key} data={project} />;
                    })}
                </Slider>
                {filteredProjects.length === 0 && (
                    <p className={classes.EmptyState}>No projects match this skill yet.</p>
                )}
                {data.button !== undefined && data.button.visible !== false && (
                    <Animation className={classes.MoreProjects} type="fadeIn">
                        <Button
                            type={ButtonType.LINK}
                            externalLink={true}
                            url={data.button.url}
                            label={data.button.label}
                        />
                    </Animation>
                )}
            </Section>
        </Animation>
    );
}
