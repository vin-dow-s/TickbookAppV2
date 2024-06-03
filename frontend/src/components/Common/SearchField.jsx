//Modules
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colors } from '../../styles/global-styles'

//Styled components declarations
const InputContainer = styled.div`
    display: flex;
    flex: none;
    align-items: center;
    justify-content: end;

    input {
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        border-bottom: 1px solid black;
        outline: none;
        background-color: transparent;
        font-style: italic;
    }

    li {
        display: flex;
        width: 7em;
        color: ${colors.darkBlueBgen};
        font-weight: bold;
        text-decoration: underline;
        cursor: pointer;
        user-select: none;
    }

    .toggleFilterField {
        transition: transform 25ms;

        &:active {
            transform: scale(0.93);
        }
    }
`

//Search component : input field + toggle
const SearchField = ({
    onSearchChange,
    filterField,
    toggleFilterField,
    searchTerm,
}) => {
    let displayLabel

    if (filterField) {
        displayLabel = (field) => {
            if (field === 'Ref') {
                return 'Equip Ref'
            }
            return field.charAt(0).toUpperCase() + field.slice(1)
        }
    }

    let placeholderText = 'Search by...'

    if (filterField === 'CabNum') {
        placeholderText = 'Search by Cable No.'
    } else if (filterField === 'Name') {
        placeholderText = 'Search by Name'
    } else if (filterField === 'EquipRef') {
        placeholderText = 'Search by Equip Ref'
    } else if (filterField === 'TendSection') {
        placeholderText = 'Search by TendSection'
    }

    const handleInputChange = (e) => {
        onSearchChange(e.target.value)
    }

    return (
        <InputContainer>
            <span>
                <input
                    type="text"
                    placeholder={placeholderText}
                    value={searchTerm}
                    onChange={handleInputChange}
                />
            </span>
            {toggleFilterField && (
                <li
                    className="toggleFilterField"
                    onClick={() => toggleFilterField()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                    >
                        <path
                            d="M2.21329 14.0601C1.92026 12.6755 1.93213 11.2743 2.21413 9.94038C3.32405 10.0711 4.29284 9.7035 4.60963 8.93871C4.92641 8.17392 4.50129 7.22896 3.62405 6.53655C4.36788 5.3939 5.35029 4.39471 6.53651 3.62289C7.22898 4.50059 8.17422 4.92601 8.9392 4.60914C9.70418 4.29227 10.0717 3.32308 9.94077 2.21281C11.3253 1.91977 12.7265 1.93164 14.0605 2.21364C13.9298 3.32356 14.2973 4.29235 15.0621 4.60914C15.8269 4.92593 16.7719 4.5008 17.4643 3.62356C18.6069 4.36739 19.6061 5.3498 20.3779 6.53602C19.5002 7.22849 19.0748 8.17373 19.3917 8.93871C19.7086 9.70369 20.6778 10.0713 21.788 9.94028C22.0811 11.3248 22.0692 12.726 21.7872 14.06C20.6773 13.9293 19.7085 14.2969 19.3917 15.0616C19.0749 15.8264 19.5 16.7714 20.3773 17.4638C19.6335 18.6064 18.651 19.6056 17.4648 20.3775C16.7724 19.4998 15.8271 19.0743 15.0621 19.3912C14.2971 19.7081 13.9296 20.6773 14.0606 21.7875C12.676 22.0806 11.2748 22.0687 9.94087 21.7867C10.0716 20.6768 9.70399 19.708 8.9392 19.3912C8.17441 19.0744 7.22945 19.4995 6.53703 20.3768C5.39439 19.633 4.3952 18.6506 3.62338 17.4643C4.50108 16.7719 4.92649 15.8266 4.60963 15.0616C4.29276 14.2967 3.32356 13.9291 2.21329 14.0601ZM4.00073 12.2104C5.10054 12.5148 6.00815 13.2117 6.45739 14.2963C6.90662 15.3808 6.75764 16.5154 6.19519 17.5083C6.29175 17.61 6.39096 17.7092 6.4927 17.8056C7.48558 17.2432 8.6201 17.0943 9.70456 17.5435C10.789 17.9927 11.4859 18.9002 11.7904 19.9999C11.9305 20.0037 12.0707 20.0038 12.2109 20.0001C12.5153 18.9003 13.2122 17.9927 14.2968 17.5435C15.3813 17.0942 16.5159 17.2432 17.5088 17.8057C17.6105 17.7091 17.7096 17.6099 17.806 17.5081C17.2437 16.5153 17.0947 15.3807 17.5439 14.2963C17.9931 13.2118 18.9007 12.5149 20.0004 12.2105C20.0042 12.0704 20.0043 11.9301 20.0006 11.7899C18.9008 11.4856 17.9932 10.7886 17.5439 9.70407C17.0947 8.61953 17.2437 7.48494 17.8061 6.49204C17.7096 6.39031 17.6104 6.2912 17.5086 6.19479C16.5158 6.75717 15.3812 6.9061 14.2968 6.4569C13.2123 6.0077 12.5154 5.10016 12.211 4.00044C12.0709 3.99666 11.9306 3.99659 11.7904 4.00024C11.486 5.10005 10.7891 6.00767 9.70456 6.4569C8.62002 6.90613 7.48543 6.75715 6.49252 6.1947C6.39079 6.29126 6.29169 6.39047 6.19528 6.49222C6.75766 7.48509 6.90659 8.61961 6.45739 9.70407C6.00819 10.7885 5.10065 11.4855 4.00092 11.7899C3.99715 11.93 3.99708 12.0702 4.00073 12.2104ZM12.0007 15.0002C10.3438 15.0002 9.00066 13.657 9.00066 12.0002C9.00066 10.3433 10.3438 9.00018 12.0007 9.00018C13.6575 9.00018 15.0007 10.3433 15.0007 12.0002C15.0007 13.657 13.6575 15.0002 12.0007 15.0002ZM12.0007 13.0002C12.5529 13.0002 13.0007 12.5525 13.0007 12.0002C13.0007 11.4479 12.5529 11.0002 12.0007 11.0002C11.4484 11.0002 11.0007 11.4479 11.0007 12.0002C11.0007 12.5525 11.4484 13.0002 12.0007 13.0002Z"
                            fill="rgba(0,102,128,1)"
                        ></path>
                    </svg>

                    {displayLabel(filterField)}
                </li>
            )}
        </InputContainer>
    )
}

SearchField.propTypes = {
    onSearchChange: PropTypes.func,
    filterField: PropTypes.string,
    toggleFilterField: PropTypes.func,
    searchTerm: PropTypes.string,
}

export default SearchField
