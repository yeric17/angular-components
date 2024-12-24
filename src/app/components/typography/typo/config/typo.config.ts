export type TypoStyle = 'heading1'|'heading2'|'heading3'|'subtitle'|'body'|'caption'|'overline'|'button'|'link'|'label'
export type TypoTag = 'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'span'|'a'|'label'
 
export type TypoConfig = {[key in TypoStyle]: {tag: TypoTag, size: string, paddingTop: string, paddingBottom: string, weight:string}}

export const baseConfig: TypoConfig = {
    heading1: {tag: 'h1', size: '2.5rem', paddingTop: '1rem', paddingBottom: '1.5rem', weight: 'bold'},
    heading2: {tag: 'h2', size: '2rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
    heading3: {tag: 'h3', size: '1.75rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
    subtitle: {tag: 'h4', size: '1.5rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
    body: {tag: 'p', size: '1.25rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'normal'},
    caption: {tag: 'span', size: '1rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'normal'},
    overline: {tag: 'span', size: '0.75rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'normal'},
    button: {tag: 'span', size: '1rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
    link: {tag: 'a', size: '1rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
    label: {tag: 'label', size: '1rem', paddingTop: '1rem', paddingBottom: '1rem', weight: 'bold'},
}