//Modules
import { useEffect, useState } from 'react'
import styled from 'styled-components'

//Hooks
import useStore from '../hooks/useStore'

//Styles and constants
import { colors } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsRevisions } from '../constants/ag-grid-columns'

//Components
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'
import { LabelInputContainer } from '../components/Common/FormBase'

//Styled components declarations
const RevisionsViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    background-color: #f7f6f3;

    .purple-label {
        color: ${colors.purpleBgen};
        font-size: small;
        font-style: italic;
    }
`

const RevisionsDataContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const RevisionsView = () => {
    const { jobNo, revisionsList, fetchRevisionsList, isLoading } = useStore(
        (state) => ({
            jobNo: state.jobNo,
            revisionsList: state.revisionsList,
            fetchRevisionsList: state.fetchRevisionsList,
            isLoading: state.isLoading,
        })
    )
    const [revisionsTableGridApi, setRevisionsTableGridApi] = useState(null)

    const revisionsTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsRevisions,
        rowSelection: 'single',
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setRevisionsTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: revisionsList })
        },

    }

    useEffect(() => {
        if (jobNo) fetchRevisionsList(jobNo)
    }, [jobNo, fetchRevisionsList])

    useEffect(() => {
        if (isLoading) {
            revisionsTableGridApi?.showLoadingOverlay()
        } else revisionsTableGridApi?.hideOverlay()
    }, [revisionsList, revisionsTableGridApi, isLoading])

    return (
        <RevisionsViewContainer>
            <RevisionsDataContainer>
                <LabelInputContainer>
                    <span className="grey-label">Revisions List</span>
                </LabelInputContainer>
                <div style={{ height: '100%' }}>
                    <StyledAGGrid
                        className="ag-theme-quartz purple-table"
                        gridOptions={revisionsTableGridOptions}
                        rowData={revisionsList}
                    />
                </div>
            </RevisionsDataContainer>
        </RevisionsViewContainer>
    )
}

export default RevisionsView
