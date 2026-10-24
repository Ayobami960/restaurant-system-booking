import Auth from "@/components/auth/Auth";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome Back!" },
    { name: "description", content: "Welcome Back!" },
  ];
}

const SignInPage = () => {
  return (
    <Auth/>
  )
}

export default SignInPage