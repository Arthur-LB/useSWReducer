import {Reducer, State, ReducerAction} from "react";
import { HTTPMethod } from 'http-method-enum'

const create =  async (prevState, action) => {
    const createdUser = await fetch(action.url, {
            method: HTTPMethod.POST,
            body: JSON.stringify(action.body)
        })
        .then(res => {
            if(res.ok) return res.json()
            return Promise.reject(res.json());
        })
        .catch((err) => {
            throw new Error(err)
        })

    const newState = {
        ...prevState,
        body: [
            ...prevState.body,
            createdUser
        ]
    }

    action.mutate(newState)
    return newState
}

const multipleDelete =  async (prevState, action) => {
    const createdUser = await fetch(action.url, {
            method: HTTPMethod.DELETE,
            body: JSON.stringify(action.body)
        })
        .then(res => {
            if(res.ok) return res.json()
            return Promise.reject(res.json());
        })
        .catch((err) => {
            throw new Error(err)
        })

    const newState = {
        ...prevState,
        body: [
            ...prevState.body.forEach(
                (el) => !action.body.includes(el.id)
            )
        ]
    }

    action.mutate(newState)
    return newState
}




export const UserListReducer : Reducer<State, ReducerAction>  =
    (prevState, action) => {
        switch (action.type) {
            case 'create' :
                create(prevState, action).then()
                break
            case 'multipleDelete' :
                multipleDelete(prevState, action).then()
                break
        }

    }