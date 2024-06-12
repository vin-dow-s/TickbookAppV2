import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colors, fonts } from '../../styles/global-styles'

const StyledButton = styled.button`
    padding: 7px 25px;
    background-color: white;
    ${fonts.narrowBold16}
    color: ${colors.purpleBgen};
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 2px 2px 2px ${colors.purpleBgenTransparent};
    transition: background-color 0.2s ease, color 0.1s ease, transform 50ms;

    &:hover {
        background-color: ${colors.purpleBgen};
        color: white;
    }

    &:active {
        transform: scale(0.93);
    }

    @media screen and (max-width: 1000px) {
        font-size: smaller;
    }
`

const Button = React.forwardRef((props, ref) => {
    const { onClick, children } = props
    return (
        <StyledButton onClick={onClick} ref={ref}>
            {children}
        </StyledButton>
    )
})

Button.displayName = 'Button'

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
}

export default Button
