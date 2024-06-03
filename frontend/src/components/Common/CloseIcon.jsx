import PropTypes from 'prop-types'
import styled from 'styled-components'

const CloseIconContainer = styled.div`
    position: absolute;
    right: 0;
    top: 17px;
    width: 24px;
    height: 24px;
    margin-right: 30px;

    &:hover {
        cursor: pointer;
    }
`

const CloseIconSVG = styled.svg`
    width: 100%;
    height: 100%;
    fill: ${({ $variant }) => ($variant === 'white' ? 'white' : 'black')};
`

const CloseIcon = ({ $variant, onClose }) => {
    const handleIconClick = (e) => {
        e.stopPropagation()
        if (onClose) {
            onClose()
        }
    }

    return (
        <CloseIconContainer onClick={handleIconClick}>
            <CloseIconSVG
                $variant={$variant}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z" />
            </CloseIconSVG>
        </CloseIconContainer>
    )
}

CloseIcon.propTypes = {
    $variant: PropTypes.oneOf(['black', 'white']).isRequired,
    onClose: PropTypes.func.isRequired,
}

export default CloseIcon
