import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
    100% {
        transform: rotate(1turn);
    }
`

const LoaderContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20000;
`

const Loader = styled.div`
    width: 56px;
    height: 56px;
    display: grid;
    animation: ${rotate} 4s infinite;

    &::before,
    &::after {
        content: '';
        grid-area: 1/1;
        border: 9px solid;
        border-radius: 50%;
        border-color: #786fff #786fff transparent transparent;
        mix-blend-mode: darken;
        animation: ${rotate} 1s infinite linear;
    }

    &::after {
        border-color: transparent transparent #00cfb9 #00cfb9;
        animation-direction: reverse;
    }
`

const MainLoader = () => {
    return (
        <LoaderContainer>
            <Loader></Loader>
        </LoaderContainer>
    )
}

export default MainLoader
