import styled from 'styled-components'
import PropTypes from 'prop-types'

const Button = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.1s, transform 50ms;
    background-color: transparent;
    color: black;

    &:active {
        transform: scale(0.93);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    &.submit {
        border: 1px solid #07bc0c;
        box-shadow: 2px 2px 2px #07bc0c;

        &:hover {
            background-color: #07bc0c;
            color: white;
        }
    }

    &.cancel {
        border: 1px solid #e74c3c;
        box-shadow: 2px 2px 2px #e74c3c;

        &:hover {
            background-color: #e74c3c;
            color: white;
        }
    }

    &:focus-visible {
        outline: 1px solid black;
    }
`

const FormButton = ({ variant, ...props }) => (
    <Button className={variant} {...props} />
)

FormButton.propTypes = {
    variant: PropTypes.oneOf(['submit', 'cancel']).isRequired,
}

export default FormButton
