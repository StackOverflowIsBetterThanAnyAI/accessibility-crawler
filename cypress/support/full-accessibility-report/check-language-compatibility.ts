import { Iso6393To1 } from './franc-map'

export const checkLanguageCompatibility = (
    declared: string,
    detected3: string
): boolean => {
    const baseDeclared = declared.split('-')[0]
    if (Iso6393To1[detected3]) {
        return Iso6393To1[detected3] === baseDeclared
    }
    return true
}
