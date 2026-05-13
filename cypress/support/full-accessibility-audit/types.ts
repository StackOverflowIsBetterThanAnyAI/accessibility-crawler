type ImpactType = 'serious' | 'critical' | 'moderate'
type TagType =
    | 'wcag2a'
    | 'wcag2aa'
    | 'wcag21a'
    | 'wcag21aa'
    | 'wcag22aa'
    | `wcag${number}`

export type CustomViolationReturnType = {
    id: string
    impact: ImpactType
    description: string
    help: string
    helpUrl: string
    nodes: ViolationNodeType[]
    tags: TagType[]
}

export type ViolationNodeType = {
    failureSummary: string
    html: string
    impact: ImpactType
    target: [string]
}
