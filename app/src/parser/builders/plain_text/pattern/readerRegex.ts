/**
 * Section start detection headers regex
 */
 const SECTION_START_REGEX = Object.freeze({
    INTRODUCTION: /^1\.\s*Introduction$/i,
    INTENT: /^\d+(\.\d+)*.*Intent$/i,
    CONTEXT: /^\d+(\.\d+)*.*Context$/i,
    PROBLEM: /^\d+(\.\d+)*.*Problem$/i,
    FORCES: /^\d+(\.\d+)*.*Forces$/i,
    SOLUTION: /^\d+(\.\d+)*.*Solution$/i,
    IMPLEMENTATION: /^\d+(\.\d+)*.*Implementation$/i,
    KNOWN_USES: /^\d+(\.\d+)*.*Known Uses$/i,
    CONSEQUENCES: /^\d+(\.\d+)*.*Consequences$/i,
    RELATED_PATTERNS: /^\d+(\.\d+)*.*Related Patterns\)?$/i,
    ALIASES: /^\d+(\.\d+)*.*Aliases\)?$/i,
    RESULTING_CONTEXT: /^\d+(\.\d+)*.*Resulting Context\)?$/i,
    EXAMPLES: /^\d+(\.\d+)*.*Examples\)?$/i,
    VARIANTS: /^\d+(\.\d+)*.*Variants\)?$/i,
});

/**
 * Subsection (for multi-pattern papers) start detection headers regex
 */
const SUBSECTION_START_REGEX = Object.freeze({
    INTENT: /^(?:Intent|INTENT):?\.?\s*(.*)$/,
    CONTEXT: /^(?:Context|CONTEXT):?\.?\s*(.*)$/,
    PROBLEM: /^(?:Problem|PROBLEM):?\.?\s*(.*)$/,
    FORCES: /^(?:Forces|FORCES):?\.?\s*(.*)$/,
    SOLUTION: /^(?:Solution|SOLUTION):?\.?\s*(.*)$/,
    IMPLEMENTATION: /^(?:Implementation|IMPLEMENTATION):?\.?\s*(.*)$/i,
    KNOWN_USES: /^(?:Known Uses|KNOWN USES|Known uses):?\.?\s*(.*)$/i,
    CONSEQUENCES: /^(?:Consequences|CONSEQUENCES|Trade-offs|TRADE-OFFS):?\.?\s*(.*)$/,
    RELATED_PATTERNS: /^(?:Related Patterns|RELATED PATTERNS|Related patterns):?\.?\s*(.*)$/,
    ALIASES: /^(?:Aliases|ALIASES):?\.?\s*(.*)$/,
    RESULTING_CONTEXT: /^(?:Resulting Context|RESULTING CONTEXT|Resulting context):?\.?\s*(.*)$/,
    EXAMPLES: /^(?:Examples?|EXAMPLES?):?\.?\s*(.*)$/,
    VARIANTS: /^(?:Variants|VARIANTS):?\.?\s*(.*)$/,
});

/**
 * General use pdf pattern extracting regex
 */
const REGEX = Object.freeze({
    INTRODUCTION_END: /^2\..*$/i,
    // eslint-disable-next-line max-len
    FRONT_PAGE_FOOTER_START: /^(Authors.\s*addresses\s*:|Corresponding\s*author\s*:|Author.s\s*address\s*:|Author.s\s*email\s*:|Permission\s*to\s*make\s*digital\s*or\s*hard\s*copies).*$/i,
    FRONT_PAGE_FOOTER_END: /^.*Copyright\s*\d{4}\s*is\s*held\s*by.*HILLSIDE.*$/i,
    PAGE_NUMBERING_FOOTER: /.*(Page\s{0,2}(-|—)|(-|—)\s{0,2}Page)\s{0,2}(\d|[IVXLCDM])+$/i,
    FIGURE_LABEL: /^Fig\.?\s*\d+\.?\s*.*$/i,
    MULTI_PATTERN_SECTION: /^\d+\.\s*(.*patterns)$/i,
    MULTI_PATTERN_PATTERN_TITLE1: /^\d+\.\d+\s*(.*)$/,
    MULTI_PATTERN_PATTERN_TITLE2: /^pattern:\s(.*)$/i,
    NON_PATTERN_TITLE: /^\d+\.\s*((?!Patterns?).)*$/i,
    EOF: /(\d+\.\s*(CONCLUSIONS|FINAL\s*REMARKS)|ACKNOWLEDGEMENTS)/,
});

export {
    SECTION_START_REGEX,
    SUBSECTION_START_REGEX,
    REGEX,
}
