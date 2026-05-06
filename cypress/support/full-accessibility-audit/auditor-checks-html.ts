import { franc } from 'franc'
import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback, CustomViolationReturnType } from './types'
import { checkLanguageCompatibility } from './check-language-compatibility'

export const checkPrimaryLanguageMismatch = (
    $html: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []

    const declaredLang = $html.attr('lang')?.trim().toLowerCase()
    if (!declaredLang) {
        return
    }

    const $body = Cypress.$('body')
    if ($body.length === 0) {
        return
    }

    const clone = $body.clone()
    clone.find('[lang]').remove()
    clone.find('script, style, noscript').remove()

    const cleanText = clone.text().replace(/\s+/g, ' ').trim()
    if (cleanText.length < 30) {
        return
    }

    const detectedLang3 = franc(cleanText)
    if (detectedLang3 === 'und') {
        return
    }

    if (!checkLanguageCompatibility(declaredLang, detectedLang3)) {
        violations.push(
            createCustomViolation({
                id: 'primary-language-mismatch',
                impact: 'serious',
                description: `The declared language "${declaredLang}" does not match the detected language`,
                help: 'The site appears to be in a different language than specified',
                helpUrl:
                    'https://www.w3.org/WAI/standards-guidelines/act/rules/ucwvc8/proposed/',
                html: $html[0].outerHTML.substring(0, 32) + '...',
                failureSummary: [
                    `Declared lang attribute: "${declaredLang}"`,
                    `Detected language (NLP): "${detectedLang3}"`,
                    'Ensure the "lang" attribute correctly identifies the primary language of the site.',
                ],
                tags: ['wcag2a', 'wcag311'],
            })
        )
    }

    if (violations.length) {
        callback(violations)
    }
}
