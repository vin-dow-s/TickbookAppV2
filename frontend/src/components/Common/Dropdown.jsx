import styled from 'styled-components'
import { colors } from '../../styles/global-styles'

export const DROPDOWN_VIEWS = [
    'Area',
    'Area-Comp',
    'Area-Section-Comp',
    'Labour-Material',
    'Section',
]

export const DropdownMenu = styled.ul`
    position: absolute;
    bottom: 10px;
    left: 100%;
    width: 180px;
    padding: 0;
    color: gray;
    background-color: white;
    border-radius: 5px;
    list-style: none;
    z-index: 1000;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);

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
    align-items: center;
    height: 20px;
    padding: 15px;
    border-radius: 5px;
    background-color: ${({ $isActive }) =>
        $isActive ? '#ebebeb' : 'transparent'};
    color: ${({ $isActive }) =>
        $isActive ? `${colors.darkBlueBgen}` : 'black'};

    &:hover&:not(active) {
        cursor: pointer;
        background-color: #f4f4f4;
    }

    ${({ $isActive }) =>
        $isActive &&
        `
        &::after {
            content: '✔';
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.darkBlueBgen};
        }
    `}
`
