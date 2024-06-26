import { create } from 'zustand'

import {
    generateProjectsURL,
    generateCodesURL,
    generateProjectCabschedsURL,
    generateProjectComponentsURL,
    generateProjectEquipmentURL,
    generateProjectTemplatesURL,
    updateEquipRecoveryAndCompletionURL,
    bulkUpdateEquipmentCompletionByComponentsURL,
    deleteEquipmentURL,
    updateEquipmentURL,
    updateComponentURL,
    deleteComponentURL,
    generateProjectComponentsBulkURL,
    generateProjectTemplatesBulkURL,
    generateTemplateComponentsURL,
    generateProjectEquipmentBulkURL,
    updateTemplateURL,
    bulkUpdateComponentsURL,
    bulkUpdateEquipmentURL,
    generateProjectCCsURL,
    updateCCsURL,
    generateProjectRevisionsURL,
    generateProjectTenderHoursURL,
    updateCabschedURL,
    deleteCabschedURL,
    generateProjectCabschedsBulkURL,
    updateCabschedCompletionURL,
    markCableAsInstalledURL,
    generateEquipmentComponentsCodesURL,
    bulkUpdateEquipmentCompletionByCodesURL,
} from '../utils/apiConfig'
import { readExcelFile } from '../utils/readExcelFile'
import {
    deduplicateComponents,
    groupComponentsByTemplateAndReturnsComponentsToCreate,
    validateTemplatesFileData,
} from '../helpers/templateHelpers'
import {
    validateEquipmentCreationFileData,
    validateEquipmentUpdateFileData,
} from '../helpers/equipmentHelpers'
import { validateCabschedCreationFileData } from '../helpers/cabschedHelpers'

const useStore = create((set) => ({
    jobNo: '',
    jobTitle: '',
    jobAddress: '',
    projectsList: [],
    codesList: [],
    componentsList: [],
    templatesList: [],
    equipmentList: [],
    cabschedsList: [],
    revisionsList: [],
    ccsList: [],
    tenderSectionsList: [],
    localMainTableRefs: [],
    isLoading: false,
    viewType: 'Section',
    dataHasChanged: false,

    setJobNo: (jobNo) => set({ jobNo }),
    setJobTitle: (jobTitle) => set({ jobTitle }),
    setJobAddress: (jobAddress) => set({ jobAddress }),
    setProjectsList: (projects) => set({ projectsList: projects }),
    setCodesList: (codes) => set({ codesList: codes }),
    setComponentsList: (components) => set({ componentsList: components }),
    setTemplatesList: (templates) => set({ templatesList: templates }),
    setEquipmentList: (equipment) => set({ equipmentList: equipment }),
    setCabschedsList: (cabscheds) => set({ cabschedsList: cabscheds }),
    setRevisionsList: (revisions) => set({ revisionsList: revisions }),
    setCCsList: (ccs) => set({ ccsList: ccs }),
    setTenderSectionsList: (tenderSections) =>
        set({ tenderSectionsList: tenderSections }),
    setLocalMainTableRefs: (refs) => set({ localMainTableRefs: refs }),
    setViewType: (type) => set({ viewType: type }),
    setDataHasChanged: (hasChanged) => set({ dataHasChanged: hasChanged }),
    resetDataHasChanged: () => set({ dataHasChanged: false }),

    fetchProjectsList: async () => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectsURL())
            const data = await response.json()
            set({ projectsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchCodesList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateCodesURL(jobNo))
            const data = await response.json()
            set({ codesList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchComponentsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectComponentsURL(jobNo))
            const data = await response.json()
            set({ componentsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchTemplatesList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectTemplatesURL(jobNo))
            const data = await response.json()
            set({ templatesList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchTemplateComponents: async (jobNo, template) => {
        try {
            const response = await fetch(
                generateTemplateComponentsURL(jobNo, template)
            )
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            const componentsInTemplate = await response.json()
            return componentsInTemplate
        } catch (error) {
            console.error('Failed to fetch template components:', error)
            return []
        }
    },

    fetchEquipmentList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectEquipmentURL(jobNo))
            const data = await response.json()
            set({ equipmentList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchEquipmentCodes: async (jobNo, area, section) => {
        try {
            const url = generateEquipmentComponentsCodesURL(
                jobNo,
                area,
                section
            )
            const response = await fetch(url)
            const data = await response.json()

            const formattedData = data.map((code) => ({
                ...code,
                PercentComplete: 'N/A',
            }))
            return { success: true, data: formattedData }
        } catch (error) {
            console.error('Error fetching components codes:', error)
            return { success: false, error }
        }
    },

    fetchCabschedsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectCabschedsURL(jobNo))
            const data = await response.json()
            set({ cabschedsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchRevisionsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectRevisionsURL(jobNo))
            const data = await response.json()
            set({ revisionsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchCCsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectCCsURL(jobNo))
            const data = await response.json()
            set({ ccsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchTenderSectionsList: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectTenderHoursURL(jobNo))
            const data = await response.json()
            set({ tenderSectionsList: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchLocalMainTableRefs: async (jobNo) => {
        set({ isLoading: true })
        try {
            const response = await fetch(generateProjectEquipmentURL(jobNo))
            const data = await response.json()
            const refs = data.map((item) => ({ Ref: item.Ref }))
            set({ localMainTableRefs: refs })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    onProjectSelect: (project) => {
        const jobNo = project?.JobNo
        const jobTitle = project?.Title
        const jobAddress = project?.Address
        set({ jobNo, jobTitle, jobAddress })
    },

    onProjectCreate: (project) => {
        set((state) => ({
            projectsList: [...state.projectsList, project],
        }))
    },

    onComponentCreate: async (jobNo, componentData) => {
        if (componentData.Name) {
            componentData.Name = componentData.Name.trim()
        }

        if (componentData.Code === 'ttl') {
            componentData = {
                ...componentData,
                LabNorm: 0,
                LabUplift: 0,
                MatNorm: 0,
                SubConCost: 0,
                SubConNorm: 0,
                PlantCost: 0,
            }
        }

        const dataToSend = {
            ...componentData,
            LabNorm: parseFloat(componentData.LabNorm),
            LabUplift: parseFloat(componentData.LabUplift),
            MatNorm: parseFloat(componentData.MatNorm),
            SubConCost: parseFloat(componentData.SubConCost),
            SubConNorm: parseFloat(componentData.SubConNorm),
            PlantCost: parseFloat(componentData.PlantCost),
        }

        if (componentData.Code !== 'cbs') {
            delete dataToSend.GlandNorm
            delete dataToSend.TestNorm
        }

        try {
            const response = await fetch(generateProjectComponentsURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            })

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            } else if (!response.ok) {
                console.error(
                    'Error:',
                    'An error occurred while creating a new Component.'
                )
                const responseBody = await response.json()
                console.error('Error:', responseBody.message)
                return { success: false, error: responseBody.message }
            } else if (response.ok) {
                const newComponent = await response.json()
                set((state) => ({
                    componentsList: [...state.componentsList, newComponent],
                }))
                return { success: true, component: newComponent }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onComponentsBulkCreate: async (jobNo, componentsData) => {
        const processedData = componentsData.map((componentData) => ({
            Code: 'acc',
            Name: componentData.Component.trim(),
            LabUplift: 0,
            MatNorm: 0,
            SubConCost: 0,
            SubConNorm: 0,
            PlantCost: 0,
            ...componentData,
        }))

        try {
            const response = await fetch(
                generateProjectComponentsBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(processedData),
                }
            )

            const responseBody = await response.json()
            if (response.ok) {
                if (
                    responseBody?.success &&
                    Array.isArray(responseBody.success)
                ) {
                    set((state) => ({
                        componentsList: [
                            ...state.componentsList,
                            ...responseBody.success,
                        ],
                    }))
                    return {
                        success: true,
                        results: responseBody,
                    }
                } else {
                    return {
                        success: false,
                        error: 'Unexpected response format',
                    }
                }
            } else {
                return {
                    success: false,
                    error: responseBody.message,
                    statusCode: response.status,
                }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onComponentUpdate: async (
        jobNo,
        componentToUpdate,
        fieldValuesToUpdate
    ) => {
        try {
            const url = updateComponentURL(jobNo, componentToUpdate)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldValuesToUpdate),
            })

            if (response.ok) {
                const updatedComponent = await response.json()
                set((state) => ({
                    componentsList: state.componentsList.map((component) =>
                        component.ID === componentToUpdate
                            ? updatedComponent
                            : component
                    ),
                }))
                return updatedComponent
            } else {
                const responseBody = await response.json()
                console.error('Updating Error:', responseBody.message)
                return null
            }
        } catch (error) {
            console.error('Error:', error)
            return null
        }
    },

    onComponentsCodesBulkUpdate: async (jobNo, componentIds, newCode) => {
        try {
            const response = await fetch(bulkUpdateComponentsURL(jobNo), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ componentIds, newCode }),
            })

            if (response.ok) {
                set((state) => ({
                    componentsList: state.componentsList.map((component) =>
                        componentIds.includes(component.ID)
                            ? { ...component, Code: newCode }
                            : component
                    ),
                }))

                return { success: true }
            } else {
                throw new Error('Failed to update components')
            }
        } catch (error) {
            console.error('Error updating components:', error)
            return { success: false, error: error.message }
        }
    },

    onComponentDelete: async (jobNo, componentId) => {
        try {
            const response = await fetch(
                deleteComponentURL(jobNo, componentId),
                {
                    method: 'DELETE',
                }
            )

            if (response.ok) {
                set((state) => ({
                    componentsList: state.componentsList.filter(
                        (component) => component.ID !== componentId
                    ),
                }))
                return { success: true }
            } else {
                const responseBody = await response.json()
                return {
                    success: false,
                    error: responseBody.message,
                }
            }
        } catch (error) {
            console.error('Error:', error)
            return {
                success: false,
                error: error.message,
            }
        }
    },

    handleComponentFileUpload: async (
        jobNo,
        file,
        codesList,
        setCreationStepMessage
    ) => {
        try {
            setCreationStepMessage('Reading Excel file...')
            const jsonData = await readExcelFile(file)
            let finalComponentsData = []
            const nonExistingCodes = new Set()

            for (const componentData of jsonData) {
                const codeExists = codesList.some(
                    (item) => item.Code === componentData.Code
                )

                if (!codeExists) {
                    nonExistingCodes.add(componentData.Code)
                    continue
                }

                finalComponentsData.push({
                    ...componentData,
                    lineNumber: componentData.__rowNum__ + 1,
                })
            }

            setCreationStepMessage('Creating Components...')
            const bulkCreateResult = await useStore
                .getState()
                .onComponentsBulkCreate(jobNo, finalComponentsData)

            return {
                bulkCreateResult,
                jsonDataLength: jsonData.length,
                nonExistingCodes,
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            return { success: false, error: error.message }
        }
    },

    onTemplateCreate: async (jobNo, templateData) => {
        try {
            const response = await fetch(generateProjectTemplatesURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData),
            })

            if (!response.ok) {
                const responseBody = await response.json()
                throw new Error(responseBody.message)
            }

            const newTemplate = await response.json()

            set((state) => ({
                templatesList: [...state.templatesList, newTemplate],
            }))

            return { success: true, template: newTemplate }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onTemplatesBulkCreate: async (jobNo, templatesMap) => {
        const templatesData = Array.from(templatesMap.entries()).map(
            ([template, components]) => ({
                Name: template,
                components: components.map((component) => ({
                    compName: component.component,
                    compLabNorm: component.labNorm,
                    inOrder: component.inOrder,
                })),
                JobNo: jobNo,
            })
        )

        try {
            const response = await fetch(
                generateProjectTemplatesBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(templatesData),
                }
            )

            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            set((state) => ({
                templatesList: [
                    ...state.templatesList,
                    ...responseBody.success,
                ],
            }))

            const { success, alreadyExists, failures } = responseBody

            return {
                successCount: success.length,
                templatesAlreadyExisting: alreadyExists.length,
                failureCount: failures.length,
            }
        } catch (error) {
            console.error('Error creating templates in bulk:', error)
            return {
                successCount: 0,
                templatesAlreadyExisting: 0,
                failureCount: 0,
            }
        }
    },

    onTemplateUpdate: async (jobNo, templateName, components) => {
        const bodyData = {
            jobNo,
            components,
        }

        try {
            const response = await fetch(
                updateTemplateURL(jobNo, templateName),
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                }
            )

            if (response.status === 409) {
                const responseBody = await response.json()
                console.error('Conflict Error:', responseBody.message)
                return { success: false, error: responseBody.message }
            } else if (!response.ok) {
                const responseBody = await response.json()
                console.error('Error:', responseBody.message)
                return { success: false, error: responseBody.message }
            } else {
                const updatedTemplate = await response.json()

                set((state) => ({
                    templatesList: state.templatesList.map((template) =>
                        template.Name === templateName
                            ? updatedTemplate
                            : template
                    ),
                }))

                return { success: true, template: updatedTemplate }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onTemplateDuplicate: async (jobNo, templateData) => {
        try {
            const response = await fetch(
                generateTemplateComponentsURL(jobNo, templateData.Name)
            )

            if (!response.ok) {
                throw new Error('Failed to fetch components for the template')
            }

            const componentsInTemplate = await response.json()
            const componentsData = componentsInTemplate.map((comp) => ({
                compName: comp.Component,
                compLabNorm: comp.LabNorm,
            }))
            const newTemplateName = `${templateData.Name}x`
            const newTemplateData = {
                jobNo,
                WholeEstimate: false,
                Name: newTemplateName,
                components: componentsData,
            }

            const createResponse = await fetch(
                generateProjectTemplatesURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTemplateData),
                }
            )
            if (createResponse.status === 409) {
                const responseBody = await createResponse.json()
                throw new Error(responseBody.message)
            } else if (!createResponse.ok) {
                throw new Error(
                    'An error occurred while duplicating the Template.'
                )
            } else {
                const newTemplate = await createResponse.json()

                set((state) => ({
                    templatesList: [...state.templatesList, newTemplate],
                }))

                return { success: true, template: newTemplate }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    handleTemplateFileUpload: async (jobNo, event, setCreationStepMessage) => {
        setCreationStepMessage('Reading Excel file...')

        try {
            const file = event.target.files[0]
            const jsonData = await readExcelFile(file)

            const componentsInProject = await useStore.getState().componentsList

            const errorMessages = validateTemplatesFileData(jsonData)

            if (errorMessages.length > 0) {
                return { success: false, errors: errorMessages }
            }

            setCreationStepMessage('Creating Components...')

            const result =
                groupComponentsByTemplateAndReturnsComponentsToCreate(
                    jsonData,
                    componentsInProject
                )

            if (result.error) {
                return { success: false, errors: [result.error] }
            }

            const { componentsToCreate, templatesMap } = result

            const deduplicatedComponents =
                deduplicateComponents(componentsToCreate)
            const componentsCreated = await useStore
                .getState()
                .onComponentsBulkCreate(jobNo, deduplicatedComponents)

            setCreationStepMessage('Creating Templates...')

            const { successCount, templatesAlreadyExisting, failureCount } =
                await useStore
                    .getState()
                    .onTemplatesBulkCreate(jobNo, templatesMap)

            const hasValidEquipQty = Array.from(templatesMap.values()).some(
                (components) =>
                    components.some(
                        (component) =>
                            component.equipQty && component.equipQty > 0
                    )
            )
            let equipmentCreated = { uniqueEquipmentCount: 0 }

            if (hasValidEquipQty) {
                setCreationStepMessage('Creating Equipment...')
                equipmentCreated = await useStore
                    .getState()
                    .onEquipmentBulkCreateOnTemplateUpload(jobNo, templatesMap)
            }

            return {
                success: true,
                jsonDataLength: jsonData.length,
                successCount,
                componentsCreated: componentsCreated.results.success,
                componentsCreatedCount:
                    componentsCreated.results.success.length,
                equipmentCreatedCount: equipmentCreated.uniqueEquipmentCount,
                templatesAlreadyExisting,
                failureCount,
                errors: [],
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            return { success: false, errors: [error.message] }
        } finally {
            setCreationStepMessage('')
        }
    },

    onEquipmentCreate: async (jobNo, equipmentData) => {
        try {
            const response = await fetch(generateProjectEquipmentURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipmentData),
            })

            const responseBody = await response.json()
            if (!response.ok) {
                const error = new Error(responseBody.message)
                error.statusCode = response.status
                throw error
            }

            set((state) => ({
                equipmentList: [...state.equipmentList, responseBody],
            }))

            return { success: true, equipment: responseBody }
        } catch (error) {
            if (error.statusCode === 409) {
                return { success: false, error: error.message, type: 'exists' }
            }
            return { success: false, error: error.message, type: 'general' }
        }
    },

    onEquipmentBulkCreateOnTemplateUpload: async (jobNo, templatesMap) => {
        const equipmentData = []

        for (const [template, componentsArray] of templatesMap.entries()) {
            const equipQty = isNaN(componentsArray[0].equipQty)
                ? 0
                : componentsArray[0].equipQty

            for (let i = 1; i <= equipQty; i++) {
                const equipRef =
                    equipQty !== 1
                        ? `${template}-${String(i).padStart(2, '0')}`
                        : template
                const existingEquipment = await useStore
                    .getState()
                    .equipmentList.find((equip) => equip.Ref === equipRef)

                if (!existingEquipment) {
                    equipmentData.push({
                        JobNo: jobNo,
                        Ref: equipRef,
                        Description: 't.b.a',
                        Template: template,
                        Components: componentsArray.map((c) => c.component),
                        Section: 't.b.a',
                        Area: 't.b.a',
                    })
                }
            }
        }

        try {
            const response = await fetch(
                generateProjectEquipmentBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(equipmentData),
                }
            )

            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            set((state) => ({
                equipmentList: [
                    ...state.equipmentList,
                    ...responseBody.success,
                ],
            }))

            const { success, failures, uniqueEquipmentCount } = responseBody
            return {
                successCount: success.length,
                failureCount: failures.length,
                uniqueEquipmentCount,
            }
        } catch (error) {
            console.error('Error creating Equipment in bulk:', error)
            return {
                successCount: 0,
                failureCount: 0,
            }
        }
    },

    onEquipmentBulkCreateOnEquipmentUpload: async (
        jobNo,
        jsonData,
        equipmentList
    ) => {
        let equipmentAlreadyExisting = []
        let equipmentData = []

        const existingEquipmentRefs = new Set(equipmentList.map((e) => e.Ref))

        jsonData.forEach((row) => {
            const equipRefBase = row.Ref
            const equipQty = isNaN(parseInt(row.EquipQty))
                ? 1
                : parseInt(row.EquipQty)

            for (let i = 0; i < equipQty; i++) {
                let equipRef = equipRefBase
                if (equipQty !== 1) {
                    const refSuffix = String(i + 1).padStart(2, '0')
                    equipRef = `${equipRefBase}-${refSuffix}`
                }

                if (!existingEquipmentRefs.has(equipRef)) {
                    equipmentData.push({
                        JobNo: jobNo,
                        Ref: equipRef,
                        Description: row.Description,
                        Template: row.Template,
                        Section: row.Section,
                        Area: row.Area,
                    })
                } else {
                    equipmentAlreadyExisting.push(equipRef)
                }
            }
        })

        // Ensure equipmentData is not empty before making the request
        if (equipmentData.length === 0) {
            return {
                successCount: 0,
                failureCount: 0,
                uniqueEquipmentCount: 0,
                equipmentAlreadyExisting,
            }
        }

        // Sending bulk request
        try {
            const response = await fetch(
                generateProjectEquipmentBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(equipmentData),
                }
            )

            const responseBody = await response.json()

            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            if (responseBody.success.length > 0)
                set((state) => ({
                    equipmentList: [
                        ...state.equipmentList,
                        ...responseBody.success,
                    ],
                }))

            const { success, failures, uniqueEquipmentCount, existingRefs } =
                responseBody

            return {
                successCount: success.length,
                failureCount: failures.length,
                uniqueEquipmentCount,
                equipmentAlreadyExisting: existingRefs,
            }
        } catch (error) {
            console.error('Error creating Equipment in bulk:', error)
            return {
                successCount: 0,
                equipmentAlreadyExisting: equipmentData.map((e) => e.Ref),
                failureCount: equipmentData.length,
            }
        }
    },

    onEquipmentUpdate: async (jobNo, oldRef, fieldValuesToUpdate) => {
        try {
            const url = updateEquipmentURL(jobNo, oldRef)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldValuesToUpdate),
            })

            if (response.ok) {
                const updatedEquipmentFromServer = await response.json()

                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) =>
                            equip.Ref === oldRef
                                ? updatedEquipmentFromServer.updatedEquipment
                                : equip
                    )
                    const updatedCabschedsList = state.cabschedsList.map(
                        (cabsched) =>
                            updatedEquipmentFromServer.updatedCabscheds.find(
                                (updated) => updated.CabNum === cabsched.CabNum
                            ) || cabsched
                    )
                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })

                return { success: true }
            } else {
                const errorText = await response.text()
                console.error('Failed to update equipment:', errorText)
                return { success: false, error: errorText }
            }
        } catch (error) {
            console.error('Error while updating the equipment:', error)
            return { success: false, error: error.message }
        }
    },

    onEquipmentBulkUpdateOnEquipmentUpload: async (
        jobNo,
        dataToUpdate,
        equipmentList
    ) => {
        try {
            const headers = Object.keys(dataToUpdate[0])
            const fieldToUpdate = headers[1]

            const { validData, errorMessages: validationErrors } =
                validateEquipmentUpdateFileData(dataToUpdate)

            if (validationErrors.length > 0) {
                return {
                    success: false,
                    error: 'Invalid data.',
                    errorMessages: validationErrors,
                }
            }

            const errorMessages = []

            const bulkUpdateData = validData
                .map((row) => {
                    const equipRef = row['Ref']
                    const newValue = row[fieldToUpdate]

                    if (newValue === undefined) {
                        const errorMessage = `Value for ${fieldToUpdate} is missing in reference ${equipRef}`
                        console.error(errorMessage)
                        errorMessages.push(errorMessage)
                        return null
                    }

                    const existingEquipment = equipmentList.find(
                        (equipment) => equipment.Ref === equipRef
                    )
                    if (!existingEquipment) {
                        const errorMessage = `Equipment ${equipRef} not found`
                        console.error(errorMessage)
                        errorMessages.push(errorMessage)
                        return null
                    }

                    return {
                        Ref: equipRef,
                        [fieldToUpdate]: newValue,
                    }
                })
                .filter((update) => update !== null)

            if (bulkUpdateData.length === 0) {
                return {
                    success: false,
                    error: 'No valid updates to send.',
                    errorMessages,
                }
            }

            if (fieldToUpdate === 'Template') {
                const errorMessage =
                    'Templates have to be updated manually (Dashboard -> Right click on the main table -> Edit Equipment).'
                return {
                    success: false,
                    error: errorMessage,
                    errorMessages: [errorMessage, ...errorMessages],
                }
            }

            const url = bulkUpdateEquipmentURL(jobNo)

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkUpdateData),
            })

            if (response.ok) {
                const updatedEquipmentFromServer = await response.json()

                set((state) => ({
                    equipmentList: state.equipmentList.map((equip) =>
                        updatedEquipmentFromServer.updatedRefsArray.includes(
                            equip.Ref
                        )
                            ? updatedEquipmentFromServer.updatedEquipmentLists.find(
                                  (e) => e.Ref === equip.Ref
                              )
                            : equip
                    ),
                    cabschedsList: state.cabschedsList.map(
                        (cabsched) =>
                            updatedEquipmentFromServer.updatedCabscheds.find(
                                (c) => c.CabNum === cabsched.CabNum
                            ) || cabsched
                    ),
                }))

                const successCount =
                    updatedEquipmentFromServer.updatedRefsArray.length
                const failureCount = bulkUpdateData.length - successCount

                return {
                    success: true,
                    successCount,
                    failureCount,
                    updatedRefsArray:
                        updatedEquipmentFromServer.updatedRefsArray,
                    errorMessages,
                    message: updatedEquipmentFromServer.message,
                }
            } else {
                const responseBody = await response.json()
                throw new Error(responseBody.message || 'Error during update')
            }
        } catch (error) {
            console.error('Error updating Equipment list:', error)
            return {
                success: false,
                error: 'Error occurred while updating Equipment list.',
                errorMessages: [error.message],
            }
        }
    },

    onEquipmentCompletionUpdate: async (
        jobNo,
        ID,
        percentComplete,
        rowData
    ) => {
        let url
        let bodyData
        const currentRecovery = (
            (rowData.LabNorm * percentComplete) /
            100
        ).toFixed(2)

        //Check the type of the Equipment to update the correct field
        switch (rowData.Type) {
            case 'Cable':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    CabComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableA':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    AGlandComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableZ':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    ZGlandComp: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            case 'CableT':
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    CabNum: ID,
                    CabTest: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                }
                break
            default:
                url = updateEquipRecoveryAndCompletionURL(jobNo, ID)
                bodyData = {
                    JobNo: jobNo,
                    Ref: rowData.Ref,
                    ID: ID,
                    Complete: Math.round(percentComplete),
                    CurrentRecovery: currentRecovery,
                    Type: 'Component',
                }
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            })

            if (response.ok) {
                const result = await response.json()
                const recalculatedRow = result.recalculatedRow

                // Update state for equipmentList and cabschedsList as needed
                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) => {
                            if (result?.updatedItem?.ID === equip.ID) {
                                return {
                                    ...equip,
                                    Complete: result.updatedItem.Complete,
                                    Description: result.updatedItem.Description,
                                    Template: result.updatedItem.Template,
                                    Area: result.updatedItem.Area,
                                }
                            }
                            return equip
                        }
                    )

                    const updatedCabschedsList = state.cabschedsList.map(
                        (existingCable) => {
                            if (
                                result?.updatedItem?.CabNum ===
                                existingCable.CabNum
                            ) {
                                return {
                                    ...existingCable,
                                    ...result.updatedItem,
                                }
                            }
                            return existingCable
                        }
                    )

                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })

                return recalculatedRow
            } else {
                console.error('Failed to update item:', await response.text())
                throw new Error('Failed to update item.')
            }
        } catch (error) {
            console.error('Error while updating the completion:', error)
            throw error
        }
    },

    onEquipmentCompletionByComponentsBulkUpdate: async (jobNo, updates) => {
        try {
            const response = await fetch(
                bulkUpdateEquipmentCompletionByComponentsURL(jobNo),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ updates }),
                }
            )

            if (response.ok) {
                const result = await response.json()
                const recalculatedRow = result.recalculatedRow[0]

                // Update state for equipmentList and cabschedsList as needed
                set((state) => {
                    const updatedEquipmentList = state.equipmentList.map(
                        (equip) => {
                            const updatedEquip = result.updatedEquipments.find(
                                (updated) => updated.ID === equip.ID
                            )
                            if (updatedEquip) {
                                return {
                                    ...equip,
                                    Complete: updatedEquip.Complete,
                                    Description: updatedEquip.Description,
                                    Template: updatedEquip.Template,
                                    Area: updatedEquip.Area,
                                }
                            }
                            return equip
                        }
                    )

                    const updatedCabschedsList = state.cabschedsList.map(
                        (existingCable) => {
                            const cableToUpdate = result.updatedCabscheds.find(
                                (updatedCableFromServer) =>
                                    updatedCableFromServer.CabNum ===
                                    existingCable.CabNum
                            )
                            return cableToUpdate || existingCable
                        }
                    )

                    return {
                        equipmentList: updatedEquipmentList,
                        cabschedsList: updatedCabschedsList,
                        dataHasChanged: true,
                    }
                })

                return recalculatedRow
            } else {
                console.error('Failed to update items:', await response.text())
                throw new Error('Failed to update items.')
            }
        } catch (error) {
            console.error('Error while updating the completion:', error)
            throw error
        }
    },

    onEquipmentCompletionByCodesBulkUpdate: async (jobNo, updates) => {
        try {
            const response = await fetch(
                bulkUpdateEquipmentCompletionByCodesURL(jobNo),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates),
                }
            )

            if (response.ok) {
                const updatedEquipmentFromServer = await response.json()

                set((state) => ({
                    equipmentList: state.equipmentList.map((equip) =>
                        updatedEquipmentFromServer.updatedItems.includes(
                            equip.Ref
                        )
                            ? {
                                  ...equip,
                                  ...updatedEquipmentFromServer.updatedEquipmentLists.find(
                                      (e) => e.Ref === equip.Ref
                                  ),
                              }
                            : equip
                    ),
                }))

                return { success: true, updatedEquipmentFromServer }
            } else {
                const errorText = await response.text()
                console.error(
                    'Failed to update equipment completion:',
                    errorText
                )
                return { success: false, error: errorText }
            }
        } catch (error) {
            console.error('Error updating equipment completion:', error)
            return { success: false, error: error.message }
        }
    },

    onEquipmentDelete: async (
        jobNo,
        deletedEquipment,
        deleteAssociatedCables
    ) => {
        try {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deleteAssociatedCables: deleteAssociatedCables,
                }),
            }

            const response = await fetch(
                deleteEquipmentURL(jobNo, deletedEquipment.Ref),
                requestOptions
            )

            const result = await response.json()
            if (response.ok) {
                set((state) => ({
                    equipmentList: state.equipmentList.filter(
                        (equip) => equip.Ref !== deletedEquipment.Ref
                    ),
                    cabschedsList: deleteAssociatedCables
                        ? state.cabschedsList.filter(
                              (cable) =>
                                  !result.deletedCabscheds.some(
                                      (deletedCable) =>
                                          deletedCable.CabNum === cable.CabNum
                                  )
                          )
                        : state.cabschedsList,
                    dataHasChanged: true,
                }))

                return {
                    success: true,
                    deletedCabschedsCount: result.deletedCabscheds.length,
                }
            } else {
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, message: error.message }
        }
    },

    handleEquipmentFileUpload: async (jobNo, file) => {
        set({ isLoading: true })
        try {
            const jsonData = await readExcelFile(file)
            if (!jsonData || jsonData.length === 0)
                throw new Error('The file is empty.')

            const isUpdateOperation = Object.keys(jsonData[0]).includes(
                'TotalHours'
            )

            const equipmentList = useStore.getState().equipmentList
            let result

            if (!isUpdateOperation) {
                const validatedData = validateEquipmentCreationFileData(
                    jsonData,
                    useStore.getState().templatesList
                )

                if (validatedData.nonExistentTemplates.length > 0) {
                    return {
                        success: false,
                        errorMessages: [
                            `The following Templates do not exist: ${validatedData.nonExistentTemplates.join(
                                ', '
                            )}.`,
                        ],
                    }
                }

                result = await useStore
                    .getState()
                    .onEquipmentBulkCreateOnEquipmentUpload(
                        jobNo,
                        validatedData.equipList,
                        equipmentList
                    )

                result.errorMessages = validatedData.errorMessages
                result.nonExistentTemplates = validatedData.nonExistentTemplates
            } else {
                result = await useStore
                    .getState()
                    .onEquipmentBulkUpdateOnEquipmentUpload(
                        jobNo,
                        jsonData,
                        equipmentList
                    )

                result.errorMessages = result.errorMessages || []
                result.nonExistentTemplates = []
            }

            return {
                ...result,
                linesProcessed: jsonData.length,
                isUpdateOperation,
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            return { success: false, error: error.message }
        } finally {
            set({ isLoading: false })
        }
    },

    onCabschedCreate: async (jobNo, cabschedData) => {
        try {
            const response = await fetch(generateProjectCabschedsURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cabschedData),
            })

            const responseBody = await response.json()

            if (!response.ok) {
                const error = new Error(responseBody.message)
                error.statusCode = response.status
                throw error
            }

            set((state) => ({
                cabschedsList: [...state.cabschedsList, responseBody],
            }))
            return { success: true, cabsched: responseBody }
        } catch (error) {
            if (error.statusCode === 409) {
                return { success: false, error: error.message, type: 'exists' }
            }
            return { success: false, error: error.message, type: 'general' }
        }
    },

    onCabschedsBulkCreate: async (
        jobNo,
        cabschedsToCreate,
        cabschedsList,
        cabSizesData
    ) => {
        const newCabscheds = cabschedsToCreate.filter(
            (cabsched) =>
                !cabschedsList.some(
                    (existing) => existing.CabNum === cabsched.CabNum
                )
        )

        const bulkCreateData = newCabscheds.map((cabsched) => {
            const component = cabSizesData.find(
                (cabSize) => cabSize.Name === cabsched.CabSize
            )

            return {
                JobNo: jobNo,
                CabNum: cabsched.CabNum,
                CabSize: cabsched.CabSize,
                Length: cabsched.Length,
                EquipRef: cabsched.EquipRef,
                AGlandArea: cabsched.AGlandArea,
                ZGlandArea: cabsched.ZGlandArea,
                AGlandComp: cabsched.AGlandComp || '0',
                ZGlandComp: cabsched.ZGlandComp || '0',
                CabComp: cabsched.CabComp || '0',
                CabTest: cabsched.CabTest || '0',
                Component_ID: component ? component.id : null,
            }
        })

        try {
            const response = await fetch(
                generateProjectCabschedsBulkURL(jobNo),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bulkCreateData),
                }
            )

            const responseBody = await response.json()

            if (!response.ok) {
                throw new Error(responseBody.message)
            }

            if (responseBody.success.length > 0)
                set((state) => ({
                    cabschedsList: [
                        ...state.cabschedsList,
                        ...responseBody.success,
                    ],
                }))

            const { success, failures, alreadyExists } = responseBody
            return {
                success: true,
                successCount: success.length,
                failureCount: failures.length,
                alreadyExists,
            }
        } catch (error) {
            console.error('Error creating Cabscheds in bulk:', error)
            return {
                successCount: 0,
                failureCount: 0,
            }
        }
    },

    onCabschedUpdate: async (
        jobNo,
        cabschedToUpdate,
        fieldValuesToUpdate,
        equipmentRefs,
        cabSizesData
    ) => {
        const matchingComponent = cabSizesData.find(
            (component) => component.Name === fieldValuesToUpdate.CabSize
        )

        // Find the matching EquipRef in mainTableData
        const matchingEquipRef = equipmentRefs.find(
            (item) => item.Ref === fieldValuesToUpdate.EquipRef
        )

        // If a matching EquipRef is found, update the ZGlandArea
        if (matchingEquipRef) {
            fieldValuesToUpdate.ZGlandArea =
                matchingEquipRef.Area || matchingEquipRef.Area
        }

        const finalCabschedData = {
            ...cabschedToUpdate,
            ...fieldValuesToUpdate,
            Length: parseFloat(fieldValuesToUpdate.Length),
            Component_ID: matchingComponent.id,
        }

        try {
            const response = await fetch(
                updateCabschedURL(jobNo, cabschedToUpdate.CabNum),
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalCabschedData),
                }
            )

            if (response.ok) {
                const updatedCabsched = await response.json()

                set((state) => ({
                    cabschedsList: state.cabschedsList.map((cabsched) =>
                        cabsched.CabNum === cabschedToUpdate.CabNum
                            ? updatedCabsched
                            : cabsched
                    ),
                }))

                return { success: true, cabsched: updatedCabsched }
            }

            const responseBody = await response.json()
            throw new Error(responseBody.message)
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onCabschedCompletionUpdate: async (
        jobNo,
        cabNum,
        fieldToUpdate,
        percentComplete
    ) => {
        try {
            const bodyData = {
                JobNo: jobNo,
                CabNum: cabNum,
            }

            bodyData[fieldToUpdate] = percentComplete

            const response = await fetch(
                updateCabschedCompletionURL(jobNo, cabNum),
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                }
            )

            if (response.ok) {
                const updatedCabsched = await response.json()

                set((state) => ({
                    cabschedsList: state.cabschedsList.map((cabsched) =>
                        cabsched.CabNum === cabNum ? updatedCabsched : cabsched
                    ),
                }))

                return { success: true, cabsched: updatedCabsched }
            } else {
                const responseBody = await response.json()
                return { success: false, error: responseBody.message }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onCabschedDelete: async (jobNo, cabNum) => {
        try {
            const response = await fetch(deleteCabschedURL(jobNo, cabNum), {
                method: 'DELETE',
            })

            if (response.ok) {
                set((state) => ({
                    cabschedsList: state.cabschedsList.filter(
                        (cabsched) => cabsched.CabNum !== cabNum
                    ),
                }))
                return { success: true }
            }

            const responseBody = await response.json()
            throw new Error(responseBody.message)
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onCabschedMarkedInstalled: async (jobNo, rowData) => {
        try {
            const response = await fetch(
                markCableAsInstalledURL(jobNo, rowData.CabNum),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(),
                }
            )

            if (response.ok) {
                const markedCable = {
                    ...rowData,
                    tickCabBySC: !rowData.tickCabBySC,
                }

                set((state) => ({
                    cabschedsList: state.cabschedsList.map((cabsched) =>
                        cabsched.CabNum === rowData.CabNum
                            ? markedCable
                            : cabsched
                    ),
                }))

                return { success: true, markedCable }
            } else {
                throw new Error(
                    'Failed to mark cable as installed/uninstalled.'
                )
            }
        } catch (error) {
            console.error(
                'Error marking cable as installed/uninstalled:',
                error
            )
        }
    },

    handleCabschedFileUpload: async (
        jobNo,
        file,
        cabschedsList,
        cabSizesData,
        equipmentRefs
    ) => {
        set({ isLoading: true })
        try {
            const jsonData = await readExcelFile(file)
            if (!jsonData || jsonData.length === 0)
                throw new Error('The file is empty.')

            const {
                cabscheds,
                nonExistentCabSize,
                nonExistentEquipRef,
                errorMessages,
            } = validateCabschedCreationFileData(
                jsonData,
                cabSizesData,
                equipmentRefs
            )

            if (
                nonExistentCabSize.length > 0 ||
                nonExistentEquipRef.length > 0 ||
                errorMessages.length > 0
            ) {
                return {
                    success: false,
                    errorMessages: [
                        ...errorMessages,
                        ...nonExistentCabSize.map(
                            (size) => `CabSize ${size} does not exist.`
                        ),
                        ...nonExistentEquipRef.map(
                            (ref) => `EquipRef ${ref} does not exist.`
                        ),
                    ],
                }
            }

            const result = await useStore
                .getState()
                .onCabschedsBulkCreate(
                    jobNo,
                    cabscheds,
                    cabschedsList,
                    cabSizesData
                )

            return {
                ...result,
                linesProcessed: jsonData.length,
                nonExistentCabSize,
                nonExistentEquipRef,
            }
        } catch (error) {
            console.error('Error during file processing:', error)
            return { success: false, error: error.message }
        } finally {
            set({ isLoading: false })
        }
    },

    onCcCreate: async (jobNo, ccData) => {
        try {
            const response = await fetch(generateProjectCCsURL(jobNo), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ccData),
            })

            if (!response.ok) {
                const responseBody = await response.json()
                throw new Error(responseBody.message)
            }

            const newCcs = await response.json()

            set((state) => ({
                ccsList: [...state.ccsList, ...newCcs],
            }))

            return { success: true, ccs: newCcs }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },

    onCcUpdate: async (jobNo, equipRef, ccRef, dateLift) => {
        try {
            const response = await fetch(updateCCsURL(jobNo, equipRef, ccRef), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ DateLift: dateLift }),
            })

            if (!response.ok) {
                const responseBody = await response.json()
                throw new Error(responseBody.message)
            }

            set((state) => ({
                ccsList: state.ccsList.map((cc) =>
                    cc.EquipRef === equipRef && cc.CcRef === ccRef
                        ? {
                              ...cc,
                              DateLift: dateLift,
                              Status: dateLift ? 'lifted' : 'current',
                          }
                        : cc
                ),
            }))

            return { success: true }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, error: error.message }
        }
    },
}))

export default useStore
