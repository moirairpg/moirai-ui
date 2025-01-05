import { Link } from "react-router-dom";
import { UserAuthForm } from "./userAuthForm";
import Logo from "../../../assets/logo.png";
const RightSide = () => {
  return (
    <div className="lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {/* <h1 className="text-2xl font-bold">Welcome back</h1> */}
          <a
            href="#"
            className="flex items-center gap-2 self-center font-large"
          >
            <div className="flex items-center justify-center rounded-md text-primary-foreground">
              <img src={Logo} width={50} height={50} alt="Moirai Logo" />
            </div>
            Moirai
          </a>
          <p className="text-2xl font-semibold tracking-tight">
            Login to your account
          </p>
          <p className="text-sm">
            and dive into a universe of endless possibilities!
          </p>
        </div>
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking, you agree to our
          <Link
            to="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>
          and
          <Link
            to="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default RightSide;
