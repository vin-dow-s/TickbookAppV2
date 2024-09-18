import { useState, useEffect } from 'react'

/**
 * @file Custom hook to fetch data from API
 */
export const useFetch = (url, refreshDataTrigger) => {
    //States to store fetched data, loading, and errors
    const [data, setData] = useState([])
    const [isLoading, setLoading] = useState(!!url)
    const [error, setError] = useState(false)

    useEffect(() => {
        //Reset states defined above if there's no URL
        if (!url) {
            setData([])
            setLoading(false)
            setError(false)
            return
        }

        setLoading(true)

        //Async function to fetch data from a given URL
        const fetchDataFromAPI = async () => {
            try {
                const response = await fetch(url, {
                    credentials: 'include',
                })
                const result = await response.json()
                setData(result)
            } catch (err) {
                console.error('Error with API call:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchDataFromAPI()
    }, [url, refreshDataTrigger])

    return { isLoading, data, error }
}
