const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const createUser = function (email, password, users) {
  const userID = generateRandomString();
  const user = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  console.log("New user created:", user);
  users[userID] = user;
  return userID;
}

const urlsForUser = function(id) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = { 
  generateRandomString,
  createUser,
  urlsForUser,
  getUserByEmail
};