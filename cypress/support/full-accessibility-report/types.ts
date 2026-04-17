type ImpactType = 'serious' | 'critical' | 'moderate'
type TagType = 'wcag2a' | 'wcag2aa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa'

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
    nodes: [
        {
            failureSummary: string
            html: string
            impact: ImpactType
            target: [string]
        },
    ]
    tags: TagType[]
}

export type CustomAuditCallback = (
    violations: CustomViolationReturnType[]
) => void
