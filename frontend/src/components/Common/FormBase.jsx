import styled from 'styled-components'
import { colors } from '../../styles/global-styles'

export const FormBase = styled.form`
    display: flex;
    flex-direction: column;
    padding: 25px;
    gap: 15px;
`

export const FieldsContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 35px;
`

export const ButtonsContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 15px;
    gap: 15px;
`

export const FormField = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    margin: 10px 15px;

    label {
        flex-shrink: 0;
        width: auto;
        letter-spacing: 0.5px;
    }

    input,
    select,
    textarea {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid ${colors.tablesBorders};
        border-radius: 5px;
        color: ${colors.purpleBgenDarker};
        transition: border-color 0.2s;

        &:focus {
            border-color: ${colors.purpleBgen};
            outline: none;
        }

        &::placeholder {
            font-style: italic;
            color: #888;
        }

        &.valid {
            border-color: #07bc0c;
        }

        &.invalid {
            border-color: #e74c3c;
        }
    }

    select {
        background-color: white;
    }
`

export const LabelInputContainer = styled.div`
    display: flex;
    align-items: center;
`

export const ErrorMessage = styled.span`
    position: absolute;
    width: 100%;
    left: 0;
    bottom: -15px;
    color: #e74c3c;
    font-size: 0.65rem;
    overflow: visible;
    white-space: nowrap;
    text-align: right;
`
