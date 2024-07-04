import styled from 'styled-components'
import { colors } from '../../styles/global-styles'

export const FormBase = styled.form`
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    margin-top: auto;

    @media screen and (max-width: 800px) {
        margin-top: 10px;
    }

    @media screen and (max-width: 1017px), screen and (max-height: 700px) {
        font-size: smaller;
    }
`

export const FormField = styled.div`
    position: relative;
    display: flex;
    align-items: flex-start;
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
        margin-left: 10px;
        padding: 10px;
        border: 1px solid ${colors.tablesBorders};
        border-radius: 5px;
        color: ${colors.purpleBgenDarker};
        transition: border-color 0.2s;

        &:focus {
            border-color: ${colors.purpleBgen};
            box-shadow: 0 0 0 2px rgba(120, 111, 255, 0.1);
            outline: none;
        }

        &::placeholder {
            font-style: italic;
            color: #888;
        }

        &.valid {
            border-color: #10d317;
            box-shadow: 0 0 0 2px rgba(16, 211, 23, 0.1);
        }

        &.invalid {
            border-color: #e74c3c;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
        }

        &.equipRef {
            width: 7em;
            flex-grow: 0;

            &:hover {
                border-color: #adadad;
            }

            &:focus {
                border-color: #00cfb9;

                box-shadow: 0 0 0 2px rgba(0, 207, 185, 0.1);
            }
        }
    }

    select {
        background-color: white;
    }

    .select__option {
        cursor: pointer;
    }

    .select__option--is-focused {
        background-color: ${colors.purpleBgenTransparent};
    }
`

export const LabelInputContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`

export const ErrorMessage = styled.span`
    position: absolute;
    width: 100%;
    left: 0;
    top: 42px;
    color: #e74c3c;
    font-size: 0.65rem;
    overflow: visible;
    white-space: nowrap;
    text-align: right;
`
