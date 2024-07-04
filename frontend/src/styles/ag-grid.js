import styled from 'styled-components'
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
            box-shadow: 0 0 0 2px rgba(120, 111, 255, 0.1);
        }

        .ag-list-item.ag-active-item {
            background-color: rgba(120, 111, 255, 0.3);
        }

        .ag-cell-inline-editing {
            border-color: #786fff !important;
        }

        input[class^='ag-'][type='text']:focus,
        input[class^='ag-'][type='number']:focus,
        input[class^='ag-'][type='date']:focus {
            border-color: #786fff;
            box-shadow: 0 0 0 2px rgba(120, 111, 255, 0.1);
        }

        .ag-radio-button-input-wrapper.ag-checked::after {
            color: #786fff;
        }

        .ag-header-cell-filtered {
            background-color: rgba(120, 111, 255, 0.3) !important;
            color: black !important;
        }

        .ag-wrapper.ag-input-wrapper input {
            box-sizing: border-box;
            width: 100%;
        }

        .ag-input-field-input {
            border-radius: 4px;
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

    .ag-cell-edit-input {
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
        box-shadow: none;
        font-size: 1rem;
    }
`
