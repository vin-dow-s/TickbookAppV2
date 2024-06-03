import styled from 'styled-components'
import { fonts, colors } from './global-styles'

export const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 900;
`

export const DialogBoxContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    width: 40em;
    background-color: transparent;
    color: black;
    z-index: 1000;
    outline: 1px solid black;
    border-radius: 25px;
    overflow: hidden;
    transform: translate(-50%, -50%);
`

export const DialogHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding: 20px 20px 20px 40px;
    background: linear-gradient(
        180deg,
        rgba(120, 111, 255, 1) 0%,
        rgba(65, 60, 140, 1) 100%
    );
    background-repeat: no-repeat;
    color: white;
    border-bottom: 1px solid black;
    text-transform: uppercase;
    ${fonts.narrowBold16}
`

export const DialogContent = styled.div`
    background-color: ${colors.mainFrameBackground};
    color: black;
    border-top: none;
    border-bottom-left-radius: 25px;
    border-bottom-right-radius: 25px;

    td:last-of-type {
        padding: 0;

        input {
            width: 40%;
            padding: 2px;
        }
    }

    .invalid-class {
        background-color: #f8d7da;
        color: #721c24;

        &:hover {
            background-color: #f5c6cb;
            color: #721c24;
        }

        svg {
            position: relative;
            z-index: 1000;
        }
    }

    @media screen and (max-height: 760px), screen and (max-width: 1120px) {
        font-size: small;

        table {
            thead {
                font-size: small;
            }
        }
    }
`
