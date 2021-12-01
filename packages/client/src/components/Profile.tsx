import {
  Alert,
  Avatar,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { UserContext } from "../contexts/UserContext";

export default function Profile() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { userContext, setUserContext } = React.useContext(UserContext);

  const formSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setError("");

    const genericErrorMessage = "Something went wrong! Please try again later.";

    fetch("http://localhost:8080/" + "users/me", {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        first_name: data.get("firstName"),
        email: data.get("email"),
        last_name: data.get("lastName"),
        username: data.get("username"),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 400) {
            setError("Please fill all the fields correctly!");
          } else if (response.status === 401) {
            setError("Invalid email and password combination.");
          } else if (response.status === 500) {
            console.log(response);
            const data = await response.json();
            if (data.message) setError(data.message || genericErrorMessage);
          } else {
            setError(genericErrorMessage);
          }
          setIsSubmitting(false);
        } else {
          if (data.get("password") != "") {
            fetch("http://localhost:8080/" + "users/updatePassword", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userContext.token}`,
              },
              body: JSON.stringify({
                password: data.get("password"),
              }),
            })
              .then(async (response) => {
                setIsSubmitting(false);
                if (!response.ok) {
                  if (response.status === 400) {
                    setError("Please fill all the fields correctly!");
                  } else if (response.status === 401) {
                    setError("Invalid email and password combination.");
                  } else if (response.status === 500) {
                    console.log(response);
                    const data = await response.json();
                    if (data.message)
                      setError(data.message || genericErrorMessage);
                  } else {
                    setError(genericErrorMessage);
                  }
                }
              })
              .catch((error) => {
                setIsSubmitting(false);
                setError(genericErrorMessage);
              });
          } else {
            setIsSubmitting(false);
          }
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        setError(genericErrorMessage);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  const fetchUserDetails = React.useCallback(() => {
    fetch("http://localhost:8080/" + "users/me", {
      method: "GET",
      credentials: "include",
      // Pass authentication token as bearer token in header
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setUserContext((oldValues: any) => {
          return { ...oldValues, details: data };
        });
      } else {
        if (response.status === 401) {
          // Edge case: when the token has expired.
          // This could happen if the refreshToken calls have failed due to network error or
          // User has had the tab open from previous day and tries to click on the Fetch button
          window.location.reload();
        } else {
          setUserContext((oldValues: any) => {
            return { ...oldValues, details: null };
          });
        }
      }
    });
  }, [setUserContext, userContext.token]);

  React.useEffect(() => {
    // fetch only when user details are not present
    if (!userContext.details) {
      fetchUserDetails();
    }
  }, [userContext.details, fetchUserDetails]);

  return userContext.details === null ? (
    <div>"Error Loading User details"</div>
  ) : !userContext.details ? (
    <CircularProgress />
  ) : (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {error && <Alert severity="warning">{error}</Alert>}
      <Box
        component="form"
        noValidate
        onSubmit={formSubmitHandler}
        sx={{ mt: 3 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoComplete="username"
              name="username"
              defaultValue={userContext.details.username}
              required
              fullWidth
              id="username"
              label="Username"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              autoComplete="given-name"
              name="firstName"
              defaultValue={userContext.details.first_name}
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              defaultValue={userContext.details.last_name}
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              defaultValue={userContext.details.email}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {`${isSubmitting ? "Saving" : "Save"}`}
        </Button>
      </Box>
    </Box>
  );
}
