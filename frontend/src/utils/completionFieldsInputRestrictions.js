export const restrictInputToNumbersInRange = () => {
    setTimeout(() => {
        const inputElement = document.activeElement
        if (inputElement && inputElement.tagName === 'INPUT') {
            inputElement.addEventListener('input', () => {
                const value = inputElement.value
                if (
                    value !== '' &&
                    (isNaN(value) ||
                        parseInt(value) < 0 ||
                        parseInt(value) > 100)
                ) {
                    inputElement.value = value.slice(0, -1)
                }
            })

            inputElement.addEventListener('keydown', (event) => {
                // Allow only number keys, control keys, and specific functional keys
                const isControlKey = [
                    'Backspace',
                    'ArrowLeft',
                    'ArrowRight',
                    'Delete',
                    'Tab',
                    'Enter',
                ].includes(event.key)
                const isNumber =
                    (event.key >= '0' && event.key <= '9') ||
                    event.key === 'ArrowUp' ||
                    event.key === 'ArrowDown'

                if (!isControlKey && !isNumber) {
                    event.preventDefault()
                }
            })
        }
    }, 0)
}
