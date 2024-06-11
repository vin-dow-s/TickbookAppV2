import { createGlobalStyle, css } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

    //Custom fonts used across the application
    @font-face {
        font-family: 'Archivo';
        src: url('/fonts/Archivo.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
    }

    @font-face {
        font-family: 'ArchivoNarrow';
        src: url('/fonts/ArchivoNarrow.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
    }
    
    :root {
        //Color variables
        --main-frame-background-color: #F0F0F0;
        --tables-background-color: #D9D9D9;
        --tables-borders-color: #c2c2c2;
        --light-blue-bgen: #00CFB9;
        --light-blue-bgen-transparent: 'rgba(0, 207, 185, 0.5)';
        --dark-blue-bgen: #006680;
        --dark-blue-bgen-transparent: 'rgba(0, 102, 128, 0.5)';
        --purple-bgen: #786FFF;
        
        //Font variables
        --font-family-archivo: 'Archivo', sans-serif;
        --font-family-archivo-narrow: 'Archivo Narrow', sans-serif;
        
        --font-size-14: 14px;
        --font-size-16: 16px;
        --font-size-18: 18px;
        --font-size-20: 20px;
    }

    // Global styles for custom scrollbars
    // Default (Purple) Scrollbar:
    // Firefox
    * {
        scrollbar-width: thin;
    }

    // Chrome, Edge, and Safari
    *::-webkit-scrollbar {
        width: 7px;
    }

    *::-webkit-scrollbar-track {
        background: transparent;
    }

    *::-webkit-scrollbar-thumb {
        border: none;
        border-radius: 10px;
    }

    // Light Blue Scrollbar:
    // Firefox
    .main-table {
        --ag-scrollbar-face-color: var(--light-blue-bgen);
        --ag-scrollbar-face-hover-color: darken(var(--light-blue-bgen), 10%);
        scrollbar-color: var(--light-blue-bgen) transparent !important;
    }

    // Chrome, Edge, and Safari
    .main-table::-webkit-scrollbar-thumb {
        background-color: var(--light-blue-bgen) !important;
    }

    
    // Dark Blue Scrollbar:
    // Firefox
    .view-table {
        --ag-scrollbar-face-color: var(--dark-blue-bgen);
        --ag-scrollbar-face-hover-color: darken(var(--dark-blue-bgen), 10%);
        scrollbar-color: var(--dark-blue-bgen) transparent !important;
    }

    // Chrome, Edge, and Safari
    .view-table::-webkit-scrollbar-thumb {
        background-color: var(--dark-blue-bgen) !important;
    }

    // Purple Scrollbar:
    // Firefox
    .purple-table {
        --ag-scrollbar-face-color: var(--purple-bgen);
        --ag-scrollbar-face-hover-color: darken(var(--purple-bgen), 10%);
        scrollbar-color: var(--purple-bgen) transparent !important;
    }

    // Chrome, Edge, and Safari
    .purple-table::-webkit-scrollbar-thumb {
        background-color: var(--purple-bgen) !important;
    }


    body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;

        font-family: var(--font-family-archivo);
        font-size: var(--font-size-14);
        
        ul {
            list-style: none;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="number"] {
            appearance: initial;
            -moz-appearance: textfield;
        }

        input[type="checkbox"] {
            accent-color: var(--purple-bgen);
        }
        

        .ag-theme-quartz {
            --ag-checkbox-checked-color: var(--purple-bgen) !important;
            --ag-active-color: var(--purple-bgen) !important;
        }

        .quick-filter-input {
            box-sizing: border-box;
            height: 30px;
            width: 15em;
            padding: 0 10px;
            font-size: 14px;
            border: 1px solid #d9d9d9;
            border-radius: 7px;
            outline: none;
            background-image: url('/search-line.svg');
            background-repeat: no-repeat;
            background-position: right 10px center;
            padding-right: 30px;
            transition: all 0.1s;

            &:hover {
                border-color: #adadad;
            }

            &:focus {
                border-color: #00cfb9;

                box-shadow: 0 0 0 2px rgba(0, 207, 185, 0.1);
            }

            &::placeholder {
                color: gray;
                font-size: small;
            }

            &.purple {
                &:focus {
                    border-color: #786FFF;

                    box-shadow: 0 0 0 2px rgba(120, 111, 255, 0.1);
                }   
            }
        }

        .purple-label {
            padding: 10px;;
            color: var(--purple-bgen);
            font-size: small;
            font-style: italic;
        }

        .grey-label {
            align-self: end;
            color: #5e6066;
            font-size: smaller;
            font-style: italic;
        }
    }
`

//Pre-defined font styles for reuse across components
export const fonts = {
    narrowBold20: css`
        font-family: var(--font-family-archivo-narrow);
        font-size: var(--font-size-20);
        font-weight: bold;
    `,
    narrowBold18: css`
        font-family: var(--font-family-archivo-narrow);
        font-size: var(--font-size-18);
        font-weight: bold;
    `,
    narrowBold16: css`
        font-family: var(--font-family-archivo-narrow);
        font-size: var(--font-size-16);
        font-weight: bold;
    `,
    narrowRegular14: css`
        font-family: var(--font-family-archivo-narrow);
        font-size: var(--font-size-14);
    `,
    bold14: css`
        font-family: var(--font-family-archivo);
        font-size: var(--font-size-14);
        font-weight: bold;
    `,
    regular14: css`
        font-family: var(--font-family-archivo);
        font-size: var(--font-size-14);
    `,
    regular16: css`
        font-family: var(--font-family-archivo);
        font-size: var(--font-size-16);
    `,
}

export const colors = {
    mainFrameBackground: '#F0F0F0',
    tablesBackground: '#D9D9D9',
    tablesBorders: '#C2C2C2',
    lightBlueBgen: '#00CFB9',
    lightBlueBgenTransparent: 'rgba(0, 207, 185, 0.5)',
    darkBlueBgen: '#006680',
    darkBlueBgenTransparent: 'rgba(0, 102, 128, 0.5)',
    purpleBgen: '#786FFF',
    purpleBgenDarker: '#413C8C',
    purpleBgenTransparent: 'rgba(120, 111, 255, 0.5)',
}

export default GlobalStyle
