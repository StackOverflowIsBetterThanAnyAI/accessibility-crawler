import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Audit } from '@siteimprove/alfa-test-utils'
import { W3CActTestCaseType } from '../support/full-accessibility-audit/types'

describe('System Benchmark: W3C ACT Rules Validation (Alfa)', () => {
    const benchmarkData = require('../fixtures/testcases.json')

    // 1172      676      496
    // 459       190      269
    // 382       158      224
    // 331       328      3     8fc3b6 #1, ff89c9 #2, ff89c9 #5

    const actToAlfaMap: Record<string, string> = {
        '2779a5': 'sia-r1',
        '23a2a8': 'sia-r2',
        b5c3f8: 'sia-r4',
        bf051a: 'sia-r5',
        de46e4: 'sia-r7',
        e086e5: 'sia-r8',
        bc659a: 'sia-r9',
        '73f2c2': 'sia-r10',
        c487ae: 'sia-r11',
        '97a4e1': 'sia-r12',
        cae760: 'sia-r13',
        '4b1c6c': 'sia-r15',
        '4e8ab6': 'sia-r16',
        '5c01ea': 'sia-r18',
        '6a7281': 'sia-r19',
        '5f99a7': 'sia-r20',
        eac66b: 'sia-r27',
        '59796f': 'sia-r28',
        afb423: 'sia-r29',
        e7aa44: 'sia-r30',
        b20e66: 'sia-r41',
        ff89c9: 'sia-r42',
        '7d6734': 'sia-r43',
        b33eff: 'sia-r44',
        a25f45: 'sia-r45',
        d0f69e: 'sia-r46',
        b4f0c3: 'sia-r47',
        aaa1bf: 'sia-r48',
        '4c31df': 'sia-r49',
        '80f0bf': 'sia-r50',
        '8fc3b6': 'sia-r63',
        ffd0e9: 'sia-r64',
        oj04fd: 'sia-r65',
        bc4a75: 'sia-r68',
        '46ca7f': 'sia-r86',
        '307n5z': 'sia-r90',
        '24afc2': 'sia-r91',
        '9e45ec': 'sia-r92',
        m6b1q3: 'sia-r94',
        bisz58: 'sia-r96',
        '674b10': 'sia-r110',
        c4a8a4: 'sia-r114',
        b49b2e: 'sia-r115',
        '2t702h': 'sia-r116',
    }

    benchmarkData.testcases.forEach((tc: W3CActTestCaseType) => {
        it(`Alfa: ${tc.ruleId} - ${tc.testcaseTitle}`, () => {
            cy.visit(tc.url)

            const targetAlfaRuleId = actToAlfaMap[tc.ruleId]

            cy.document()
                .then(AlfaCypress.toPage)
                .then(async (page) => {
                    return await Audit.run(page)
                })
                .then((alfaResult) => {
                    const aggregates = Array.from(alfaResult.resultAggregates)

                    const targetEntry = aggregates.find(([uri]) =>
                        uri.endsWith(`/${targetAlfaRuleId}`)
                    )

                    let outcome = 'inapplicable'
                    if (targetEntry) {
                        const stats = targetEntry[1]
                        if (stats.failed > 0) outcome = 'failed'
                        else if (stats.passed > 0) outcome = 'passed'
                    }

                    cy.log(
                        `Rule: ${targetAlfaRuleId} | Expected: ${tc.expected} | Got: ${outcome}`
                    )

                    if (
                        outcome === 'inapplicable' &&
                        tc.expected !== 'inapplicable'
                    ) {
                        console.warn(
                            `Alfa Rule ${targetAlfaRuleId} not applicable on ${tc.url}`
                        )
                    }

                    expect(outcome).to.equal(tc.expected)
                })
        })
    })
})
