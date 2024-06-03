/**
 * @file REGEX patterns (must match frontend ones)
 */

//Common patterns
const alphanumericWithSpacesPattern =
    /^(?!-| |.{46,}$)(?!.*[- ]$)[a-zA-Z0-9]+([ -][a-zA-Z0-9]+)*$/
const alphanumericWithSpacesAndSlashesPattern =
    /^(?!.* [-/ ]$)(?!-|\/| |\.|.{46,})([a-zA-Z0-9]+(?:[ -/?][a-zA-Z0-9]+)*\??)$/
const alphanumericWithSpacesDashesParenthesesPattern =
    /^(?!.*[-\/ ]$)(?!-|\/| |\.|.{46,})[a-zA-Z0-9\s\/()&-]+$/
const onlyFloatsPattern = /^(\d+(\.\d+)?|\d+(,\d+)?)$/

//Codes
const codeCodePattern = /^[a-zA-Z]{3}$/

//Projects
const projectNumberPattern = /^[a-zA-Z][0-9]{5}([a-zA-Z])?$/

//Components
const componentsCodePattern = /^[A-Za-z]{3}$/
const componentsNamePattern =
    /^(?!-|\/|\s|.{181,}$)(?!.*[-/\s]$)[a-zA-Z0-9/&|¬()' x?]+([ -/][a-zA-Z0-9/&|¬()' x?]+)*$/

//Templates
const templatesTempNamePattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{81,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/

//Equipment
const equipmentRefPattern =
    /^(?!-|\/|.{81,})[a-zA-Z0-9]+(?:[-/][a-zA-Z0-9]+)*(?:\([a-zA-Z0-9/-]+\))?$/
const equipmentDescriptionPattern =
    /^(?!.*[-/ ]$)(?!-|\/|.{81,})([a-zA-Z0-9?(). -]+(?:[ -/][a-zA-Z0-9?(). -]+)*?)$/
const equipmentProgIDPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{21,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/
const equipmentTendIDPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{41,})([a-zA-Z0-9() -]+(?:[ -/][a-zA-Z0-9() -]+)*?)$/
const equipmentTendSectionPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{81,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/
const equipmentCurrentRevisionPattern =
    /^(?!.*[-/ ]$)(?!-|\/| |.{6,})([a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*?)$/

//CCs
const ccRefPattern = /^(?!-|\/| |.{26,}$)[a-zA-Z0-9]+(?:[ -/][a-zA-Z0-9]+)*$/
const ccDescriptionPattern = /^[a-zA-Z0-9 ,.!?;:'"()%/&-]*$/

module.exports = {
    alphanumericWithSpacesPattern,
    alphanumericWithSpacesAndSlashesPattern,
    alphanumericWithSpacesDashesParenthesesPattern,
    onlyFloatsPattern,
    codeCodePattern,
    projectNumberPattern,
    componentsCodePattern,
    componentsNamePattern,
    templatesTempNamePattern,
    equipmentRefPattern,
    equipmentDescriptionPattern,
    equipmentProgIDPattern,
    equipmentTendIDPattern,
    equipmentTendSectionPattern,
    equipmentCurrentRevisionPattern,
    ccRefPattern,
    ccDescriptionPattern,
}
