import Auth from "@/components/auth/Auth";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Account in DineFlow Restaurant" },
    { name: "description", content: "Welcome to the Sign Up!" },
  ];
}

const SignUpPage = () => {
  return (
    <Auth/>
  )
}

export default SignUpPage