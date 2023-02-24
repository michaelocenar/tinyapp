const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

describe('getUserByEmail', function() {
  const users = {
    'userRandomID': {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'password'
    }
  };

  it('should return a user object when provided with an email that exists in the database', function() {
    const user = getUserByEmail('user@example.com', users);
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'password'
    };
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefined when provided with an email that does not exist in the database", () => {
    const user = getUserByEmail("nonexistent@example.com", users);
    assert.isUndefined(user);
  });
});