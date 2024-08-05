import React from "react";
import { TextField, Button, Stack, Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../auth/loginThunk";

const LoginForm = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.login);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Please enter a valid email"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const defaultValues = {
    email: "",
    password: "",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const { handleSubmit, control, reset } = methods;

  const onSubmit = async ({ email, password }) => {
    const result = await dispatch(loginUser(email, password));

    Swal.fire({
      title: result.success ? "Login Success" : "Login Failed",
      html: result.success
        ? `Name: ${result.user.name}<br/>Email: ${result.user.email}`
        : result.error,
      icon: result.success ? "success" : "error",
    }).then(() => reset());
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Box>
        <h1>Login</h1>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} width={400}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    error={!!error}
                    helperText={error ? error.message : null}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    error={!!error}
                    helperText={error ? error.message : null}
                  />
                )}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={loading}
              >
                {loading ? "loading..." : "Login"}
              </LoadingButton>
            </Stack>
          </form>
        </FormProvider>
      </Box>
    </Box>
  );
};

export default LoginForm;
