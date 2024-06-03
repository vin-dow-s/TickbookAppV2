import styled, { keyframes } from 'styled-components'
import { colors } from '../../styles/global-styles'

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`

const Loader = styled.div`
    height: 0;
    width: 0;
    padding: 10px;
    border: 6px solid ${(props) => props.color || colors.lightBlueBgen};
    border-bottom-color: transparent;
    border-radius: 22px;
    animation: ${rotate} 1s infinite linear;
`

export default Loader

export const overlayLoadingTemplateLightBlue = `
    <div class="custom-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div style="
            height: 0;
            width: 0;
            padding: 10px;
            border: 6px solid ${colors.lightBlueBgen};
            border-bottom-color: transparent;
            border-radius: 22px;
            animation: rotate 1s infinite linear;
        "></div>
    </div>
    <style>
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`

export const overlayLoadingTemplateDarkBlue = `
    <div class="custom-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div style="
            height: 0;
            width: 0;
            padding: 10px;
            border: 6px solid ${colors.darkBlueBgen};
            border-bottom-color: transparent;
            border-radius: 22px;
            animation: rotate 1s infinite linear;
        "></div>
    </div>
    <style>
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`

export const overlayLoadingTemplatePurple = `
    <div class="custom-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div style="
            height: 0;
            width: 0;
            padding: 10px;
            border: 6px solid ${colors.purpleBgen};
            border-bottom-color: transparent;
            border-radius: 22px;
            animation: rotate 1s infinite linear;
        "></div>
    </div>
    <style>
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`
