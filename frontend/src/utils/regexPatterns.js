/**
 * @file REGEX patterns (must match frontend ones)
 */

//Common patterns
export const alphanumericWithSpacesPattern =
    /^(?!-| |.{46,}$)(?!.*[- ]$)[a-zA-Z0-9]+([ -][a-zA-Z0-9]+)*$/
export const alphanumericWithSpacesAndSlashesPattern =
    /^(?!.* [-/ ]$)(?!-|\/| |\.|.{46,})([a-zA-Z0-9]+(?:[ -/?][a-zA-Z0-9]+)*\??)$/
export const alphanumericWithSpacesDashesParenthesesPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |\.|.{46,})[a-zA-Z0-9\s/()&-]+$/
export const onlyFloatsPattern = /^(\d+(\.\d+)?|\d+(,\d+)?)$/

//Codes
export const codeCodePattern = /^[a-zA-Z]{3}$/

//Projects
export const projectNumberPattern = /^[a-zA-Z][0-9]{5}([a-zA-Z])?$/

//Components
export const componentsCodePattern = /^[A-Za-z]{3}$/
export const componentsNamePattern =
    /^(?!-|\/|\s|.{181,}$)(?!.*[-/\s]$)[a-zA-Z0-9/&|¬()' x?]+([ -/][a-zA-Z0-9/&|¬()' x?]+)*$/

//Templates
export const templatesTempNamePattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{81,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/

//Equipment
export const equipmentRefPattern =
    /^(?!-|\/|.{81,})[a-zA-Z0-9]+(?:[-/][a-zA-Z0-9]+)*(?:\([a-zA-Z0-9/-]+\))?$/
export const equipmentDescriptionPattern =
    /^(?!.*[-/ ]$)(?!-|\/|.{81,})([a-zA-Z0-9?(). -]+(?:[ -/][a-zA-Z0-9?(). -]+)*?)$/
export const equipmentProgIDPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{21,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/
export const equipmentTendIDPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{41,})([a-zA-Z0-9() -]+(?:[ -/][a-zA-Z0-9() -]+)*?)$/
export const equipmentTendSectionPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{81,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/
export const equipmentCurrentRevisionPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{6,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/

//CCs
export const ccRefPattern =
    /^(?!-|\/| |.{26,}$)[a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*$/
export const ccDescriptionPattern = /^[a-zA-Z0-9 ,.!?;:'"()%/&-]*$/
