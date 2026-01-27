import React from 'react';
import { GatsbyImage } from 'gatsby-plugin-image';
import { Animation } from 'gatsby-theme-portfolio-minimal/src/components/Animation';
import { Button, ButtonType } from 'gatsby-theme-portfolio-minimal/src/components/Button';
import { Section } from 'gatsby-theme-portfolio-minimal/src/components/Section';
import { PageSection } from 'gatsby-theme-portfolio-minimal/src/types';
import interestsContent from '../../../../content/sections/interests/interests.json';
import { useLocalDataSource } from './data';
import * as classes from './style.module.css';

export function InterestsSection(props: PageSection): React.ReactElement {
    const response = useLocalDataSource();
    const data = response.allInterestsJson.sections[0];
    const shouldShowButton = data.button?.visible !== false;
    const initiallyShownInterests = data.button?.initiallyShownInterests ?? 5;
    const [shownInterests, setShownInterests] = React.useState<number>(
        shouldShowButton ? initiallyShownInterests : data.interests.length,
    );
    const [revealFromIndex, setRevealFromIndex] = React.useState<number | null>(null);

    function loadMoreHandler() {
        setRevealFromIndex(shownInterests);
        setShownInterests(data.interests.length);
    }

    function skillClickHandler(label: string) {
        if (typeof window === 'undefined') {
            return;
        }
        window.dispatchEvent(new CustomEvent('portfolio-skill-filter', { detail: { skill: label } }));
        if (typeof document !== 'undefined') {
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const visibleInterests = React.useMemo(
        () =>
            data.interests.slice(0, shownInterests).map((interest, index) => ({
                ...interest,
                _index: index,
            })),
        [data.interests, shownInterests],
    );

    const categoryLookup = React.useMemo(() => {
        const lookup = new Map<string, string>();
        (interestsContent?.interests ?? []).forEach((interest: { label?: string; category?: string }) => {
            if (!interest?.label) {
                return;
            }
            lookup.set(interest.label, interest.category?.trim() || 'Other');
        });
        return lookup;
    }, []);

    const groupedInterests = React.useMemo(() => {
        const grouped = new Map<string, typeof visibleInterests>();
        visibleInterests.forEach((interest) => {
            const category = categoryLookup.get(interest.label) || 'Other';
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category)?.push(interest);
        });
        return Array.from(grouped.entries());
    }, [visibleInterests]);

    return (
        <Animation type="fadeUp">
            <Section anchor={props.sectionId} heading={props.heading}>
                <div className={classes.Categories}>
                    {groupedInterests.map(([category, interests]) => (
                        <div key={category}>
                            <div className={classes.CategoryHeading}>{category}</div>
                            <div className={classes.InterestsGrid}>
                                {interests.map((interest) => {
                                    const shouldReveal =
                                        revealFromIndex !== null && interest._index >= revealFromIndex;
                                    const isLongLabel = interest.label.length > 18;
                                    const isExtraLongLabel = interest.label.length > 26;
                                    return (
                                        <button
                                            key={`${category}-${interest.label}-${interest._index}`}
                                            type="button"
                                            className={`${classes.Interest} ${
                                                shouldReveal ? classes.InterestReveal : ''
                                            }`}
                                            style={
                                                shouldReveal
                                                    ? { animationDelay: `${(interest._index - revealFromIndex) * 40}ms` }
                                                    : undefined
                                            }
                                            onClick={() => skillClickHandler(interest.label)}
                                            aria-label={`Filter projects by ${interest.label}`}
                                        >
                                            {interest.image.src && (
                                                <GatsbyImage
                                                    image={interest.image.src.childImageSharp.gatsbyImageData}
                                                    className={classes.Icon}
                                                    alt={interest.image.alt || `Interest ${interest.label}`}
                                                />
                                                )}
                                                <span
                                                    className={`${classes.Label} ${
                                                        isLongLabel ? classes.LabelSmall : ''
                                                    } ${isExtraLongLabel ? classes.LabelXSmall : ''}`}
                                                >
                                                    {interest.label}
                                                </span>
                                            </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                {shouldShowButton && shownInterests < data.interests.length && (
                    <Animation className={classes.LoadMore} type="scaleIn" delay={(shownInterests + 1) * 100}>
                        <Button
                            type={ButtonType.BUTTON}
                            onClickHandler={loadMoreHandler}
                            label={data.button?.label ?? 'Load more'}
                        />
                    </Animation>
                )}
            </Section>
        </Animation>
    );
}
