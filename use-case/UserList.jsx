import {useSWReducer} from "../UseSWReducer";
import {UserListReducer} from "./reducers/UserListReducer";
import {useState} from "react";

export const UserList = () => {
	const { data, error, isLoading, isValidating, dispatch } = useSWReducer(
		{ url: 'users' },
		UserListReducer
	)

	const {checked, setChecked} = useState([])

	if (error) return <p>{error.toString()}</p>
	if (isLoading) return <p>...Chargement</p>

	return (<>
		<button onClick={() => dispatch({
			type: 'create',
			body: {
				id: Math.random(),
				name: 'User'
			}
		})} />
		<ul>
			{
				data.body.map((user) => {
					return (
						<li key={user.id}>
							<input type="checkbox" name={`user-${user.id}`} id={`user-${user.id}`} onClick={() => setChecked([...checked, user.id])} />
							{user.name}
						</li>
					)
				})
			}
		</ul>
		<button onClick={() => dispatch({
			type: 'multipleDelete',
			body: checked
		})}/>

	</>)
}