import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { login } from "@/services/authService";
import Signup from "./signup";

export default function LoginSection() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  // const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();

  const temp_username = import.meta.env.VITE_USERNAME,
    temp_password = import.meta.env.VITE_PASSWORD;

  const handleGetOtp = () => {
    // Add your OTP sending logic here
    setIsOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    // Add your OTP verification logic here
    await login(temp_username, temp_password);
    console.log("Verifying OTP:", otp);
    navigate("/load-sync");
  };

  const handleSelectSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  const renderPhoneLogin = () => (
    <>
      <div className="text-gray-700 text-lg font-semibold">
        {isOtpSent ? " Check your phone for code" : "Log in with phone number"}
      </div>
      {isOtpSent && (
        <div className="text-gray-500 text-sm font-normal text-center">
          Please enter the code below to verify your account. A code has been
          sent to 9876543210.
          <Button
            variant="ghost"
            className="text-blue-500 p-1"
            onClick={() => setIsOtpSent(false)}
          >
            Change
          </Button>
        </div>
      )}
      <div className="w-full">
        {isOtpSent ? (
          <div className="w-full">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        ) : (
          <Input
            label="Phone Number"
            name="phone number"
            placeholder="eg. 9987665434"
            className="w-full"
            type="tel"
            pattern="[0-9]{10}"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isOtpSent}
          />
        )}
      </div>
      <Button
        className="px-12 bg-gray-700 w-full"
        onClick={isOtpSent ? handleVerifyOtp : handleGetOtp}
      >
        {isOtpSent ? "Verify OTP" : "Get OTP"}
      </Button>
      <p>
        Don't have an account?{"  "}
        <Button
          variant="ghost"
          onClick={handleSelectSignUp}
          className="p-0 text-blue-500"
        >
          Sign up
        </Button>
      </p>

      {isOtpSent && (
        <Button
          variant="ghost"
          className="text-xs text-gray-600 underline"
          onClick={() => setIsOtpSent(false)}
        >
          Resend OTP
        </Button>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center w-full h-screen py-6 pt-20">
      <div className="flex flex-col space-y-12 items-center w-1/2">
        <img src="/freight-tiger.svg" alt="Freight Tiger logo" />
        {isSignUp ? (
          <div >
            <Signup handleSelectSignUp={handleSelectSignUp} />
          </div>
        ) : (
          <div className="flex flex-col space-y-4 w-full items-center">
            {renderPhoneLogin()}

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
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
