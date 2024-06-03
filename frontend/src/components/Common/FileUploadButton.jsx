import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colors } from '../../styles/global-styles'

const FileInputContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    /* Style for the visual button */
    .file-upload-btn {
        padding: 8px 12px;
        background-color: ${colors.purpleBgen};
        color: white;
        border: none;
        border-radius: 5px;
        font-size: small;

        transition: background-color 0.3s;

        &:hover {
            background-color: ${colors.purpleBgenDarker};
        }

        img {
            margin-right: 8px;
            padding-bottom: 1px;
        }

        display: flex;
        align-items: center;
    }

    /* Hidden file input */
    .file-input {
        display: none;
    }
`

//Main component of the file
const FileUploadButton = ({ onChange }) => (
    <FileInputContainer
        onClick={() => document.getElementById('file-input').click()}
    >
        <div className="file-upload-btn">
            <img src="/export-white.svg" alt="Upload Icon" />
            Select a file...
        </div>
        <input
            id="file-input"
            className="file-input"
            type="file"
            accept=".xlsx"
            onChange={onChange}
        />
    </FileInputContainer>
)

FileUploadButton.propTypes = {
    onChange: PropTypes.func.isRequired,
}

export default FileUploadButton
