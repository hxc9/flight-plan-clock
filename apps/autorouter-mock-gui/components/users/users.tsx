import {CreateUser} from "@/components/users/createUser";
import {userService} from 'autorouter-mock-services'
import {UserTable} from "@/components/users/userTable";

export const Users = async ({userId} : {userId?: number}): Promise<JSX.Element> => {
    const users = await userService.allUsers()

    return <div>
        <h2>Users</h2>
        <h3><CreateUser/></h3>
        <UserTable users={users} selectedUser={userId}/>
    </div>
}