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
} from '../utils/apiConfig'

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

    onComponentCreate: (component) => {
        set((state) => ({
            componentsList: [...state.componentsList, component],
        }))
    },

    onComponentsBulkCreate: (components) => {
        set((state) => ({
            componentsList: [...state.componentsList, ...components],
        }))
    },

    onComponentUpdate: (updatedComponent) => {
        set((state) => ({
            componentsList: state.componentsList.map((component) =>
                component.ID === updatedComponent.ID
                    ? updatedComponent
                    : component
            ),
        }))
    },

    onComponentDelete: (deletedComponent) => {
        set((state) => ({
            componentsList: state.componentsList.filter(
                (component) => component.ID !== deletedComponent.ID
            ),
        }))
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
                    }
                })
            } else {
                console.error(
                    'Failed to update equipment:',
                    await response.text()
                )
                throw new Error('Failed to update equipment.')
            }
        } catch (error) {
            console.error('Error while updating the equipment:', error)
            throw error
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
}))

export default useStore
