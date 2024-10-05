// random list of 20 first names
const firstNames =
  ['Oliver', 'Jack', 'Harry', 'Jacob', 'Charlie', 'Thomas', 'George', 'Oscar', 'James', 'William',
    'Amelia', 'Olivia', 'Isla', 'Emily', 'Poppy', 'Ava', 'Isabella', 'Jessica', 'Lily', 'Sophie']

// random list of 20 last names
const lastNames =
  ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
    'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright']

export function generateUser(id: number) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return {
    uid: id,
    email: firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@example.com',
    lastname: lastName,
    name: firstName
  }
}
