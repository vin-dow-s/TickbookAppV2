import styled, { css } from 'styled-components'
import { colors, fonts } from './global-styles'
import { AgGridReact } from 'ag-grid-react'

export const StyledAGGrid = styled(AgGridReact)`
    /* Default styles */
    .ag-theme-quartz {
        --ag-input-focus-box-shadow: none !important;

        .ag-header-cell-filtered span {
            color: black !important;
        }
    }

    &.main-table,
    &.view-table,
    &.purple-table {
        .ag-row:hover {
            cursor: pointer;
        }

        .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
            border: 1px solid transparent;
            outline: transparent;
        }

        .ag-picker-field-wrapper:focus-within,
        input[class^='ag-']:focus {
            transition: border-color 0.1s ease-in-out,
                box-shadow 0.1s ease-in-out;
        }
    }

    &.main-table {
        --ag-row-hover-color: rgba(0, 207, 185, 0.3) !important;

        .ag-picker-field-wrapper:focus-within {
            border-color: #00cfb9;
            box-shadow: 0 0 0 2px rgba(0, 207, 185, 0.1);
        }

        .ag-list-item.ag-active-item {
            background-color: rgba(0, 207, 185, 0.3);
        }

        .ag-cell-inline-editing {
            border-color: #00cfb9 !important;
        }

        input[class^='ag-'][type='text']:focus {
            border-color: #00cfb9;
            box-shadow: 0 0 0 2px rgba(0, 207, 185, 0.1);
        }

        input[class^='ag-'][type='number']:focus {
            border-color: #00cfb9;
            box-shadow: 0 0 0 2px rgba(0, 207, 185, 0.1);
        }

        .ag-radio-button-input-wrapper.ag-checked::after {
            color: #00cfb9;
        }

        .ag-row-selected::before {
            background-color: rgba(0, 207, 185, 0.3);
        }

        .ag-header-cell-filtered {
            background-color: rgba(0, 207, 185, 0.3) !important;
            color: black !important;
        }
    }

    &.view-table {
        --ag-row-hover-color: rgba(0, 102, 128, 0.3) !important;

        .ag-picker-field-wrapper:focus-within {
            border-color: #006680;
            box-shadow: 0 0 0 2px rgba(0, 102, 128, 0.1);
        }

        .ag-list-item.ag-active-item {
            background-color: rgba(0, 102, 128, 0.3);
        }

        .ag-cell-inline-editing {
            border-color: #006680 !important;
        }

        input[class^='ag-'][type='text']:focus {
            border-color: #006680;
            box-shadow: 0 0 0 2px rgba(0, 102, 128, 0.1);
        }

        input[class^='ag-'][type='number']:focus {
            border-color: #006680;
            box-shadow: 0 0 0 2px rgba(0, 102, 128, 0.1);
        }

        .ag-radio-button-input-wrapper.ag-checked::after {
            color: #006680;
        }

        .ag-row-selected::before {
            background-color: rgba(0, 102, 128, 0.3);
        }

        .ag-header-cell-filtered {
            background-color: rgba(0, 102, 128, 0.3) !important;
            color: black !important;
        }
    }

    &.purple-table {
        --ag-row-hover-color: rgba(120, 111, 255, 0.3) !important;

        .ag-picker-field-wrapper:focus-within {
            border-color: #786fff;
            box-shadow: none;
        }

        .ag-list-item.ag-active-item {
            background-color: rgba(120, 111, 255, 0.3);
        }

        .ag-cell-inline-editing {
            border-color: #786fff !important;
        }

        input[class^='ag-'][type='text']:focus {
            border-color: #786fff;
        }

        input[class^='ag-'][type='number']:focus {
            border-color: #786fff;
        }

        input[class^='ag-'][type='date']:focus {
            border-color: #786fff;
        }

        .ag-radio-button-input-wrapper.ag-checked::after {
            color: #786fff;
        }

        .ag-row-selected::before {
            background-color: rgba(120, 111, 255, 0.3);
        }

        .ag-header-cell-filtered {
            background-color: rgba(120, 111, 255, 0.3) !important;
            color: black !important;
        }
    }

    &.basic {
        --ag-row-hover-color: none !important;

        .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
            border: 1px solid transparent;
            outline: transparent;
        }
    }

    &.no-border {
        .ag-root-wrapper {
            border: none;
        }
    }

    &.no-border-radius {
        .ag-root-wrapper {
            border-radius: 0;
        }
    }

    &.centered-text {
        text-align: center;

        .ag-header-cell-label {
            justify-content: center;
        }
    }
`

export const tableStyles = css`
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: medium;

    thead {
        ${fonts.narrowBold16};
        font-stretch: condensed;
        user-select: none;
        border-bottom: 2px solid #9c9c9c;

        th {
            position: sticky;
            top: 0;
            background-color: ${colors.tablesBackground};
            z-index: 1;
        }

        &:focus {
            outline: none;
        }
    }

    tbody {
        ${fonts.regular14}
        font-size: smaller;
        overflow-y: auto;

        > tr:hover {
            cursor: pointer;
            background-color: ${colors.lightBlueBgenTransparent};
        }
    }

    th,
    td {
        border: 1px solid ${colors.tablesBorders};
    }

    th {
        padding: 10px;
        border-top: none;
    }

    td {
        padding: 6px;
        border-top: none;
        border-bottom: none;
    }

    th:first-child,
    td:first-child {
        border-left: none;
    }

    th:last-child,
    td:last-child {
        border-right: none;
    }

    tr:not(:last-child) {
        border-bottom: 1px solid ${colors.tablesBorders};
    }

    tr.loading-row:hover {
        background-color: inherit;
    }

    @media screen and (max-height: 760px), screen and (max-width: 1120px) {
        font-size: small;

        thead {
            font-size: small;
        }
    }

    @media screen and (max-width: 1010px) {
        font-size: smaller;

        thead {
            font-size: smaller;
        }
    }
`

export const StyledTableContainer = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    max-height: 39vh;
    overflow: auto;
    background-color: ${colors.tablesBackground};

    table {
        ${tableStyles}
    }
`

const positionAbsoluteAndCenteredStyle = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`

export const EmptyDataCell = styled.td`
    ${positionAbsoluteAndCenteredStyle}
`

export const LoaderWrapper = styled.div`
    ${positionAbsoluteAndCenteredStyle}
    pointer-events: none;
`
