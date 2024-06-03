import styled from 'styled-components'
import { colors, fonts } from '../../styles/global-styles'

export const DropdownMenu = styled.ul`
    position: absolute;
    top: 100%;
    left: 0;
    width: 13em;
    margin-top: 7px;
    padding: 1px;
    color: ${colors.purpleBgen};
    background-color: white;
    border-radius: 5px;
    text-transform: capitalize;
    list-style: none;
    z-index: 1;
    ${fonts.narrowRegular14}
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

    &.visible {
        animation: fadeInDown 0.2s forwards;
    }

    @keyframes fadeInDown {
        0% {
            opacity: 0;
            transform: translateY(0);
        }
        100% {
            opacity: 1;
            transform: translateY(7px);
        }
    }
`

export const DropdownItem = styled.li`
    position: relative;
    display: flex;
    padding: 8px;
    margin: 1px 0;
    border-radius: 5px;
    background-color: ${({ $isActive }) =>
        $isActive ? `${colors.mainFrameBackground}` : 'transparent'};

    &:hover {
        cursor: pointer;
        background-color: ${colors.mainFrameBackground};
    }

    &:nth-child(6)::before {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        width: calc(100% - 40px);
        height: 1px;
        background-color: ${colors.tablesBorders};
    }

    ${({ $isActive }) =>
        $isActive &&
        `
        &::after {
            content: '✔';
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.purpleBgen};
        }
    `}

    &:last-child {
        margin-bottom: 0;
    }
`
