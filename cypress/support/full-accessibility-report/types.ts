type ImpactType = 'serious' | 'critical' | 'moderate'
type TagType =
    | 'wcag2a'
    | 'wcag2aa'
    | 'wcag21a'
    | 'wcag21aa'
    | 'wcag22aa'
    | `wcag${number}`

export type CustomViolationType = {
    description: string
    failureSummary: string[]
    help: string
    helpUrl: string
    html: string
    id: string
    impact: ImpactType
    tags: TagType[]
}

export type CustomViolationReturnType = {
    id: string
    impact: ImpactType
    description: string
    help: string
    helpUrl: string
    nodes: ViolationNodeType[]
    tags: TagType[]
}

export type CustomAuditCallback = (
    violations: CustomViolationReturnType[]
) => void

export type W3CActTestCaseType = {
    ruleId: string
    ruleName: string
    ruleAccessibilityRequirements: {
        [key: string]: {
            title: string
            forConformance: boolean
            failed: string
            passed: string
            inapplicable: string
        }
    }
    expected: string
    testcaseId: string
    testcaseTitle: string
    relativePath: string
    url: string
    rulePage: string
    approved: boolean
}

export type ViolationNodeType = {
    failureSummary: string
    html: string
    impact: ImpactType
    target: [string]
}
