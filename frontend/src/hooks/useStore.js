import { create } from 'zustand'

import {
    generateProjectsURL,
    generateCodesURL,
    generateProjectCabschedsURL,
    generateProjectComponentsURL,
    generateProjectEquipmentURL,
    generateProjectTemplatesURL,
    updateEquipRecoveryAndCompletionURL,
} from '../utils/apiConfig'

const useStore = create((set) => ({
    jobNo: '',
    jobTitle: '',
    jobAddress: '',
    projectsList: [],
    codesList: [],
    componentsList: [],
    templatesData: [],
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
            set({ templatesData: data })
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

                //Update equipmentList if it's a Component
                if (result.updatedItem.Component) {
                    set((state) => ({
                        equipmentList: state.equipmentList.map((equip) =>
                            equip.ID === ID
                                ? { ...equip, ...result.updatedItem }
                                : equip
                        ),
                        dataHasChanged: true,
                    }))
                }

                //Update cabschedsList if it's a Cable
                if (result.updatedItem.CabNum) {
                    set((state) => ({
                        cabschedsList: state.cabschedsList.map((cable) =>
                            cable.CabNum === result.updatedItem.CabNum
                                ? result.updatedItem
                                : cable
                        ),
                        dataHasChanged: true,
                    }))
                }

                return {
                    updatedAvgCompletion: result.avgCompletion,
                    updatedItem: result.updatedItem,
                }
            } else {
                console.error('Failed to update item:', await response.text())
                throw new Error('Failed to update item.')
            }
        } catch (error) {
            console.error('Error while updating the completion:', error)
            throw error
        }
    },

    onEquipmentCompletionByComponentsBulkUpdate: async (
        updatedEquipmentFromServer
    ) => {
        const updatedItemsArray = updatedEquipmentFromServer.updatedItems
        const updatedEquipmentsArray =
            updatedEquipmentFromServer.updatedEquipments
        const updatedCabschedsArray =
            updatedEquipmentFromServer.updatedCabscheds

        set((state) => {
            const updatedMainTableData = state.localMainTableData.map(
                (item) => {
                    const updatedItem = updatedItemsArray.find(
                        (updated) => updated.Ref === item.Ref
                    )
                    if (updatedItem) {
                        return {
                            ...item,
                            PercentComplete: updatedItem.PercentComplete,
                            RecoveredHours: updatedItem.RecoveredHours,
                            TotalHours: updatedItem.TotalHours,
                        }
                    }
                    return item
                }
            )

            const updatedEquipmentList = state.equipmentList.map((equip) => {
                const updatedEquip = updatedEquipmentsArray.find(
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
            })

            const updatedCabschedsList = state.cabschedsList.map(
                (existingCable) => {
                    const cableToUpdate = updatedCabschedsArray.find(
                        (updatedCableFromServer) =>
                            updatedCableFromServer.CabNum ===
                            existingCable.CabNum
                    )
                    return cableToUpdate || existingCable
                }
            )

            return {
                localMainTableData: updatedMainTableData,
                equipmentList: updatedEquipmentList,
                cabschedsList: updatedCabschedsList,
            }
        })
    },
}))

export default useStore
