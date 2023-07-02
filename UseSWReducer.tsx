import { Reducer, useReducer } from 'react'
import useSWR, { Fetcher, KeyedMutator } from 'swr'
import { BlockingData } from 'swr/_internal'
require('dotenv').config();


const fetcherFunc = (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
): Promise<Response> => fetch(input, init).then(res => res.json())

const BASE_API_URL = process.env.BASE_API_URL

const defaultKey = {
    url: null,
    size: 10,
    offset: 0,
    sortField: 'dateCreated',
    sortOrder: 'descend',
    filters: {},
    search: '',
    args: undefined
}

interface key {
    url: string | null
    size?: number
    offset?: number
    sortField?: string
    sortOrder?: string
    filters?: object
    search?: string
    args?: RequestInit | undefined
}

interface SWReducerResponse {
    isLoading: BlockingData<unknown, any> extends true ? false : boolean
    mutate: KeyedMutator<unknown>
    dispatch: (action: object) => void
    data: BlockingData<unknown, any> extends true
        ? unknown
        : unknown | undefined
    error: any
    isValidating: boolean
}

/**
 * useSWR hook that uses a reducer to manage state and dispatch actions to mutate state
 * Forward mutate function to reducer actions
 * @param key SWR key to use [default to null url and default pagination and filterings...]
 * @param reducer function to manage state (React Reducer)
 * @param pagination Boolean to set if request should be paginated [default to **true**]
 * @param fetcher function to call (default to **fetch()** & jsonify response)
 * @param initialState initial state to use [**optional**]
 * @param options useSWR options [**optional**]
 */
export const useSWReducer = (
    key: key = defaultKey,
    reducer: Reducer<any, any>,
    pagination = true,
    fetcher: Fetcher = fetcherFunc,
    initialState?: object,
    options?: any,
): SWReducerResponse => {
    const { url, size, offset, sortField, sortOrder, filters, search, args } =
        {...defaultKey, ...key}

    const base = BASE_API_URL
        ? BASE_API_URL[-1] === '/'
            ? BASE_API_URL
            : `${BASE_API_URL}/`
        : ''
    const apiUrl = new URL(`${base}${url}/`)
    if (url) {
        if (pagination) {
            apiUrl.searchParams.append('size', size.toString())
            apiUrl.searchParams.append('offset', offset.toString())
        }
        apiUrl.searchParams.append('sortField', sortField)
        apiUrl.searchParams.append('sortOrder', sortOrder)
        apiUrl.searchParams.append('filters', JSON.stringify(filters))
        apiUrl.searchParams.append('search', search)
    }

    const swrKey = url ? { url: apiUrl.href, args: args } : null

    const swr = useSWR(swrKey, fetcher, options)
    const [, dispatch] = useReducer(reducer, initialState || swr.data)

    const dispatcher = (action: object) => {
        return dispatch({ ...action, mutate: swr.mutate, url: url ? apiUrl.href : null })
    }

    return {
        ...swr,
        dispatch: dispatcher
    }
}
