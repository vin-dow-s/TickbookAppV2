/**
 * @file API configuration: connects frontend to backend part
 * The routes correspond to the routes defined in backend/api/routes.js.
 */

export const BASE_URL = 'http://localhost:4000'

export const generateCodesURL = () => `${BASE_URL}/codes`

export const generateProjectsURL = () => `${BASE_URL}/projects`

//Main Info Section
export const generateProjectInfoURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/projectInfo` : null

//Main Table
export const generateMainTableDataURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/mainTableData` : null

//Main Table EquipRef
export const generateEquipmentURL = (jobNo, equipRef) =>
    `${BASE_URL}/${encodeURIComponent(jobNo)}/${encodeURIComponent(equipRef)}`

//Summary values
export const generateProjectSummaryValues = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/summaryValues` : null

//View Table
export const generateViewTableURL = (jobNo, viewType) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/viewTableData?viewType=${encodeURIComponent(viewType)}`
        : null

//View Table Dialog Boxes
export const generateEquipmentInSectionURL = ({ jobNo, section }) =>
    `${BASE_URL}/${encodeURIComponent(jobNo)}/section/${encodeURIComponent(
        section
    )}`

export const generateEquipmentInAreaSectionCompURL = ({
    jobNo,
    area,
    section,
    component,
}) =>
    `${BASE_URL}/${encodeURIComponent(jobNo)}/area/${encodeURIComponent(
        area
    )}/section/${encodeURIComponent(section)}/component/${encodeURIComponent(
        component
    )}`

export const generateEquipmentInAreaCompURL = ({ jobNo, area, component }) =>
    `${BASE_URL}/${encodeURIComponent(jobNo)}/area/${encodeURIComponent(
        area
    )}/component/${encodeURIComponent(component)}`

//Revisions
export const generateProjectRevisionsURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/revisions` : null

//Components
export const generateProjectComponentsURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/components` : null

export const generateProjectNonCBSComponentsWithLabnormsURL = (jobNo) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/components/non-cbs-and-labnorms`
        : null

export const generateProjectComponentsBulkURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/components/bulk` : null

export const updateComponentURL = (jobNo, id) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/components/${id}` : null

export const deleteComponentURL = (jobNo, id) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/components/${id}` : null

export const isComponentUsedInTemplateURL = (jobNo, id) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/is-component-used-in-template/${id}`
        : null

//Templates
export const generateProjectTemplatesURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/templates` : null

export const generateProjectTemplatesBulkURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/templates/bulk` : null

export const generateTemplateComponentsURL = (jobNo, template) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/templates/${encodeURIComponent(template)}`
        : null

export const updateTemplateURL = (jobNo, template) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/templates/${encodeURIComponent(template)}`
        : null

//Equipment
export const generateProjectEquipmentURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/equipment` : null

export const generateProjectEquipmentRefsDescAreaURL = (jobNo) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(jobNo)}/equipment/refs-desc-area`
        : null

export const generateProjectTenderHoursURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/tender-hours` : null

export const generateProjectEquipmentBulkURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/equipment/bulk` : null

export const generateEquipmentComponentsCodesURL = (jobNo, area, section) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/equipment/area/${encodeURIComponent(
              area
          )}/section/${encodeURIComponent(section)}/codes`
        : null

export const updateEquipmentURL = (jobNo, ref) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/equipment/${encodeURIComponent(ref)}`
        : null

export const bulkUpdateEquipmentURL = (jobNo) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(jobNo)}/equipment/bulk/update`
        : null

export const deleteEquipmentURL = (jobNo, ref) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/equipment/${encodeURIComponent(ref)}`
        : null

export const bulkUpdateEquipmentCompletionURL = (jobNo) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/equipment/bulk/update-completion`
        : null

export const updateEquipRecoveryAndCompletionURL = (jobNo, id) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/equipment/update-completion/${encodeURIComponent(id)}`
        : null

//Cabscheds
export const generateProjectCabschedsURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/cabscheds` : null

export const generateProjectCabschedsBulkURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/cabscheds/bulk` : null

export const getProjectCabSizesURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/cabscheds/cabsizes` : null

export const updateCabschedURL = (jobNo, cabNum) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/cabscheds/${encodeURIComponent(cabNum)}`
        : null

export const updateCabschedCompletionURL = (jobNo, cabNum) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/cabscheds/update-completion/${encodeURIComponent(cabNum)}`
        : null

export const deleteCabschedURL = (jobNo, cabNum) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/cabscheds/${encodeURIComponent(cabNum)}`
        : null

export const markCableAsInstalledURL = (jobNo, cabNum) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/cabscheds/mark-as-installed/${encodeURIComponent(cabNum)}`
        : null

//Export
export const exportFullDetail = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/export/full-detail` : null

export const exportMainTableData = (jobNo) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(jobNo)}/export/main-table-data`
        : null

export const exportViewTableData = (jobNo, viewType) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(
              jobNo
          )}/export/view-table-data/${encodeURIComponent(viewType)}`
        : null

//CCs
export const generateProjectCCsURL = (jobNo) =>
    jobNo ? `${BASE_URL}/${encodeURIComponent(jobNo)}/ccs` : null

export const updateCCsURL = (jobNo, equipRef, ccRef) =>
    jobNo
        ? `${BASE_URL}/${encodeURIComponent(jobNo)}/ccs/${encodeURIComponent(
              equipRef
          )}/${encodeURIComponent(ccRef)}`
        : null
