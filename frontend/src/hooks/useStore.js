import { create } from 'zustand'

import {
    generateProjectsURL,
    generateCodesURL,
    generateProjectCabschedsURL,
    generateProjectComponentsURL,
    generateProjectEquipmentURL,
    generateProjectTemplatesURL,
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
    setDataHasChanged: (hasChanged) => set({ dataHasChanged: hasChanged }),
    setViewType: (type) => set({ viewType: type }),
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
}))

export default useStore
