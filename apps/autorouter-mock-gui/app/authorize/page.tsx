import { authService, userService } from 'autorouter-mock-services';
import { ReactNode } from 'react';

type AuthParams = {
  client_id?: string,
  redirect_uri?: string,
  response_type?: string,
  state?: string
}

export default async function Page({searchParams} : {searchParams: AuthParams}) {

  const {client_id, redirect_uri, response_type, state} = searchParams;

  if (!client_id || !redirect_uri || !response_type || !state) {
    return withHeader(<h3>Missing parameters</h3>);
  }

  if (!await authService.getClient(client_id)) {
    return withHeader(<h3>Invalid client</h3>);
  }

  if (response_type !== 'code') {
    return withHeader(<h3>Invalid response type</h3>);
  }

  const users = await userService.allUsers();

  return withHeader(
    users.length > 0 ? <>
      <form action="http://localhost:3000/authorize">
        <label htmlFor="user">Select user:</label>{' '}
        <select id="user" name="user">
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input type={"hidden"} name={"client_id"} value={client_id}/>
        <input type={"hidden"} name={"redirect_uri"} value={redirect_uri}/>
        <input type={"hidden"} name={"response_type"} value={response_type}/>
        <input type={"hidden"} name={"state"} value={state}/>
        <input type={"submit"} value={"Authenticate"}/>
      </form>
    </> : <h3>No users found</h3>
  );
}

function withHeader(children: ReactNode) {
  return <>
    <h2>Mock Autorouter authentication</h2>
    {children}
  </>;
}