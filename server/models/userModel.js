const fs = require('fs').promises;
const path = require('path');

// Determine DB path based on environment
const usersDbFile = process.env.NODE_ENV === 'test' ? 'users.test.json' : 'users.json';
const usersFilePath = path.join(__dirname, '..', 'db', usersDbFile);

async function readUsers() {
  try {
    // Ensure the directory exists (important for tests that might run in a slightly different setup)
    // await fs.mkdir(path.dirname(usersFilePath), { recursive: true }); // Usually not needed if db dir exists
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is invalid JSON, return an empty array
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find(user => user.email === email);
}

async function createUser(userData) {
  const users = await readUsers();
  const newUser = {
    id: Date.now().toString(),
    ...userData,
  };
  users.push(newUser);
  await writeUsers(users);
  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

module.exports = {
  findUserByEmail,
  createUser,
};
