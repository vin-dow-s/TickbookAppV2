import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colors, fonts } from '../styles/global-styles'
import { SUMMARY_LABELS } from '../constants/summary'

const SummaryContainer = styled.aside`
    display: flex;
    flex-direction: column;
    height: calc(100% - 30px);
    padding: 15px;
    background-color: white;
    color: black;
    border-radius: 8px;

    h2 {
        text-align: center;
        font-family: ${fonts.regular14};
        font-weight: normal;
        font-size: large;
        margin: 15px 0 25px 0;
    }

    ul {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        flex: 1;
        padding: 0;
        margin: 0;

        li {
            display: flex;
            justify-content: space-between;
            ${fonts.regular14};
        }
    }

    .value {
        text-align: end;
        ${fonts.bold14}
        font-size: 15px;

        color: ${colors.purpleBgenDarker};
        align-self: center;
    }
`

//Display 'N/A' when there's no value, add '%' to the percentage
function formatValue(key, value) {
    if (!value && value !== 0) {
        return 'N/A'
    }

    if (key === 'globalPercentComplete') {
        return `${value}%`
    }

    return value
}

//Main component of the file
const Summary = ({ values }) => (
    <SummaryContainer>
        <h2>Summary</h2>
        <ul>
            {/* Loop over the keys in SUMMARY_LABELS, retrieve the corresponding value, and render a <li> for each one */}
            {values &&
                SUMMARY_LABELS.map(({ key, label }, index) => {
                    const value = values[key]
                    return (
                        <li key={index}>
                            <span>{label}</span>
                            <span className="value">
                                {formatValue(key, value)}
                            </span>
                        </li>
                    )
                })}
        </ul>
    </SummaryContainer>
)

Summary.propTypes = {
    values: PropTypes.objectOf(PropTypes.number).isRequired,
}

export default Summary
