import PropTypes from 'prop-types'
import styled from 'styled-components'
import useStore from '../hooks/useStore'
import { colors, fonts } from '../styles/global-styles'

//Styled components declarations
const MainInfoSectionStyled = styled.section`
    width: calc(100% - 60px);
    display: flex;
    flex-direction: row;
    height: 30px;
    ${fonts.regular14};
    background-color: white;
    border-radius: 10px;
    padding: 15px;

    ul {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        padding: 0;
        padding-left: 20px;
        padding-right: 20px;

        li {
            text-align: left;
            font-size: 12px;
            color: gray;
        }

        span {
            ${fonts.regular14}
            font-size: large;
            text-align: left;

            color: ${colors.purpleBgenDarker};
        }
    }

    @media screen and (max-width: 1100px) {
        ul {
            div {
                padding-right: 50px;
            }
        }
    }
`

//Used to display Project Number, Project Title and Current Completion
const ProjectInfoItem = ({ label, value }) => {
    return (
        <div>
            <li>{label}</li>
            <span>{value || ''}</span>
        </div>
    )
}

ProjectInfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
}

ProjectInfoItem.defaultProps = {
    value: '',
}

//Main component of the file
const MainInfoSection = () => {
    const { jobNo, jobTitle, jobAddress } = useStore((state) => ({
        jobNo: state.jobNo,
        jobTitle: state.jobTitle,
        jobAddress: state.jobAddress,
    }))

    return (
        <MainInfoSectionStyled>
            <ul>
                <ProjectInfoItem label="Project Number" value={jobNo} />
                <ProjectInfoItem label="Project Title" value={jobTitle} />
                <ProjectInfoItem label="Project Address" value={jobAddress} />
            </ul>
        </MainInfoSectionStyled>
    )
}

export default MainInfoSection
export { ProjectInfoItem }
