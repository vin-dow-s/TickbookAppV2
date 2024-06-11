import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colors, fonts } from '../../styles/global-styles'
import { useCallback, useEffect, useRef } from 'react'

const StyledContextMenu = styled.ul`
    position: fixed;
    top: ${(props) => props.$top}px;
    left: ${(props) => props.$left}px;
    width: 180px;
    margin-top: 7px;
    padding: 0;
    color: black;
    background-color: white;
    border-radius: 5px;
    list-style: none;
    z-index: 1001;
    ${fonts.regular14}
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);

    &.visible {
        animation: fadeInDown 2s forwards;
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

const ContextMenuItem = styled.li`
    position: relative;
    height: 20px;

    display: flex;
    align-items: center;
    padding: 15px;
    gap: 10px;
    border-radius: 5px;

    text-align: left;
    cursor: pointer;

    &:last-child&:not(:only-child) {
        height: 20px;
        color: #e74c3c;
    }

    &:last-child&:not(:only-child)::before {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        width: calc(100% - 40px);
        height: 1px;
        background-color: ${colors.tablesBorders};
    }

    &:hover {
        background-color: #f4f4f4;
    }
`

//Main component of the file
const ContextMenu = ({ position, data, options, onClose, onOptionClick }) => {
    const menuRef = useRef(null)

    const handleClickOutsideMenu = useCallback(
        (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideMenu)
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideMenu)
        }
    }, [handleClickOutsideMenu])

    //Handles the click on an option of the context menu in main table
    const handleOptionClick = (option) => {
        onOptionClick(option, data)
        onClose()
    }

    return ReactDOM.createPortal(
        <StyledContextMenu
            ref={menuRef}
            $top={position.top}
            $left={position.left}
        >
            {options.map((option, index) => (
                <ContextMenuItem
                    key={index}
                    dataName={data?.name}
                    onClick={() => {
                        handleOptionClick(option)
                    }}
                >
                    {option.icon && (
                        <img src={option.icon} alt={option.label} />
                    )}
                    {option.label}
                </ContextMenuItem>
            ))}
        </StyledContextMenu>,
        document.body
    )
}

ContextMenu.propTypes = {
    position: PropTypes.shape({
        top: PropTypes.number.isRequired,
        left: PropTypes.number.isRequired,
    }).isRequired,
    data: PropTypes.object,
    options: PropTypes.array,
    onClose: PropTypes.func.isRequired,
}

export default ContextMenu
