const users = {
  valid: {
    standard_user: {
      username: "standard_user",
      password: "secret_sauce",
    },
  },
  invalid: {
    locked_out_user: {
      username: "locked_out_user",
      password: "secret_sauce",
      errorMsg: "",
    },
    problem_user: {
      username: "problem_user",
      password: "secret_sauce",
      errorMsg: "",
    },
    wrong_username: {
      username: "wrong_username",
      password: "secret_sauce",
      errorMsg: "",
    },
    wrong_password: {
      username: "standard_user",
      password: "wrong_password",
      errorMsg: "",
    },
    wrong_both: {
      username: "wrong_username",
      password: "wrong_password",
      errorMsg: "",
    },
  },
};

export default users;
