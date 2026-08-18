const users = {
  valid: {
    standardUser: {
      username: "standard_user",
      password: "secret_sauce",
    },
  },
  invalid: {
    lockedOutUser: {
      username: "locked_out_user",
      password: "secret_sauce",
      errorMsg: "Epic sadface: Sorry, this user has been locked out.",
    },
    problemUser: {
      username: "problem_user",
      password: "secret_sauce",
      errorMsg: "",
    },
    wrongUsername: {
      username: "wrong_username",
      password: "secret_sauce",
      errorMsg:
        "Epic sadface: Username and password do not match any user in this service",
    },
    wrongPassword: {
      username: "standard_user",
      password: "wrong_password",
      errorMsg:
        "Epic sadface: Username and password do not match any user in this service",
    },
    wrongBoth: {
      username: "wrong_username",
      password: "wrong_password",
      errorMsg:
        "Epic sadface: Username and password do not match any user in this service",
    },
  },
  unAuthorizedAccess: {
    errorMsg:
      "Epic sadface: You can only access '${inventoryData.basicData.pageUrl}' when you are logged in.",
  },
};

export default users;
