//Modules
import styled from 'styled-components'
import { useEffect, useState } from 'react'

//Styles and constants
import { colors, fonts } from '../styles/global-styles'
import { StyledAGGrid } from '../styles/ag-grid'
import { columnsTenderSections } from '../constants/dialog-box-tables-columns'

//Components
import { FormField } from '../components/Common/FormBase'
import { overlayLoadingTemplatePurple } from '../components/Common/Loader'
import useStore from '../hooks/useStore'

const TenderSectionsContainer = styled.div`
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

const LabelTotalHoursInputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: end;
    background-color: white;
    margin-bottom: 2px;
`

const TenderSectionsContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1.5;
    background-color: white;
    color: black;
    border-radius: 10px;
    padding: 10px;
`

const TenderSectionsFormField = styled(FormField)`
    position: relative;
    flex-direction: column;
    align-items: center;

    div {
        display: flex;
        flex-direction: column;
        margin-left: 40px;
        font-size: smaller;
        color: gray;

        span {
            ${fonts.regular14}
            font-size: large;
            text-align: center;
            color: ${colors.purpleBgenDarker};
        }
    }
`

const TenderSectionsView = () => {
    const { jobNo, tenderSectionsList, fetchTenderSectionsList, isLoading } =
        useStore((state) => ({
            jobNo: state.jobNo,
            tenderSectionsList: state.tenderSectionsList,
            fetchTenderSectionsList: state.fetchTenderSectionsList,
            isLoading: state.isLoading,
        }))

    const [tenderSectionsTableGridApi, setTenderSectionsTableGridApi] =
        useState(null)
    const [quickFilterText, setQuickFilterText] = useState('')
    const [totalHours, setTotalHours] = useState(0)

    const tenderSectionsTableGridOptions = {
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        columnDefs: columnsTenderSections,
        overlayLoadingTemplate: overlayLoadingTemplatePurple,
        onGridReady: (params) => {
            setTenderSectionsTableGridApi(params.api)
            params.api.updateGridOptions({ rowData: tenderSectionsList })
        },
    }

    useEffect(() => {
        if (isLoading) {
            tenderSectionsTableGridApi?.showLoadingOverlay()
        } else tenderSectionsTableGridApi?.hideOverlay()
    }, [tenderSectionsList, tenderSectionsTableGridApi, isLoading])

    useEffect(() => {
        if (jobNo) {
            fetchTenderSectionsList(jobNo)
        }
    }, [jobNo, fetchTenderSectionsList])

    useEffect(() => {
        if (tenderSectionsTableGridApi && quickFilterText !== null) {
            tenderSectionsTableGridApi.updateGridOptions({ quickFilterText })
        }
    }, [tenderSectionsTableGridApi, quickFilterText])

    useEffect(() => {
        if (tenderSectionsList && tenderSectionsList.length > 0) {
            let sum = tenderSectionsList.reduce(
                (acc, item) => acc + parseFloat(item.TotalHours || 0),
                0
            )

            if (sum > 0) sum = parseFloat(sum.toFixed(2))

            setTotalHours(sum)
        } else {
            setTotalHours(0)
        }
    }, [tenderSectionsList])

    return (
        <TenderSectionsContainer>
            <TenderSectionsContent>
                <LabelTotalHoursInputContainer>
                    <span className="grey-label">Tender Hours List</span>
                    <TenderSectionsFormField>
                        <div>
                            Total Hours
                            <span>{totalHours}</span>
                        </div>
                    </TenderSectionsFormField>
                    <div
                        style={{
                            position: 'relative',
                            top: '0',
                            right: '0',
                        }}
                    >
                        <input
                            className="quick-filter-input purple"
                            type="text"
                            placeholder="Search in all columns..."
                            value={quickFilterText}
                            onChange={(e) => setQuickFilterText(e.target.value)}
                        />
                    </div>
                </LabelTotalHoursInputContainer>
                <div
                    style={{
                        height: '100%',
                    }}
                >
                    <StyledAGGrid
                        className="ag-theme-quartz purple-table"
                        gridOptions={tenderSectionsTableGridOptions}
                        rowData={tenderSectionsList}
                    />
                </div>
            </TenderSectionsContent>
        </TenderSectionsContainer>
    )
}

export default TenderSectionsView
