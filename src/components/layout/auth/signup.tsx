import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignupProp {
  handleSelectSignUp: () => void;
}

const Signup = ({ handleSelectSignUp }: SignupProp) => {
  return (
    <div className="flex flex-col space-y-4 w-full items-center">
      <h3 className="text-gray-700 text-lg font-semibold mb-4">Sign up</h3>
      <div className="w-full ">
        <div className="flex gap-4 mb-4">
          <div className="w-full">
            <Input
              label="First Name"
              name="first name"
              placeholder="John"
              type="string"
              className=""
            />
          </div>
          <div className="w-full">
            <Input
              label="Last Name"
              name="last name"
              placeholder="Doe"
              type="string"
            />
          </div>
        </div>
        <Input
          label="Organization"
          name="organization"
          placeholder="eg. Freight Tiger"
          className="flex-1 mb-6"
          type="tel"
          pattern="[0-9]{10}"
          // value={phoneNumber}
          // onChange={(e) => setPhoneNumber(e.target.value)}
          // disabled={isOtpSent}
        />
      </div>
      <div className="w-full text-center ">
        <Button className="px-12 bg-gray-700 w-full">Sign up</Button>
        <p>
          Already have an account?{" "}
          <Button
            onClick={handleSelectSignUp}
            variant="ghost"
            className="p-0 text-blue-500"
          >
            Login
          </Button>
        </p>
      </div>
      <div className="relative flex items-center w-full">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <Button
        variant="outline"
        className="flex text-gray-600 items-center text-sm font-semibold w-full"
        // onClick={handleGoogleLogin}
      >
        <img src="/google.svg" alt="Google logo" />
        Sign up with Google
      </Button>
    </div>
  );
};

export default Signup;
