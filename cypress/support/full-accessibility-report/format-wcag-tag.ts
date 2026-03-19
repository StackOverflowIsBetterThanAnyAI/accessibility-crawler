export const formatWCAGTag = (tag: string) => {
    const upperTag = tag.toUpperCase()

    const matchVersion = upperTag.match(/^(WCAG)(\d+)([A]+)$/i)
    const matchSuccessCriterion = upperTag.match(/^(WCAG)(\d+)$/i)

    if (matchVersion) {
        const prefix = matchVersion[1]
        const versionDigits = matchVersion[2]
        const level = matchVersion[3]

        let version = ''
        if (versionDigits.length === 1) {
            version = `${versionDigits}.0`
        } else {
            version = versionDigits.slice(0, -1) + '.' + versionDigits.slice(-1)
        }

        return `${prefix} ${version} ${level.toUpperCase()}`
    }

    if (matchSuccessCriterion) {
        const prefix = matchSuccessCriterion[1]
        const successCriterion = matchSuccessCriterion[2]

        let criterion = ''
        for (let i = 0; i < successCriterion.length; i++) {
            criterion += successCriterion.charAt(i)
            if (i < 2 && i < successCriterion.length - 1) {
                criterion += '.'
            }
        }

        return `${prefix} ${criterion}`
    }

    return tag
}
