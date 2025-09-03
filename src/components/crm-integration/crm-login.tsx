import NextButton from "@/components/ui/next-button";
import PageWrapper from "@/components/ui/page-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormValues, loginSchema } from "@/validations/loginSchema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CrmLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log("Form Data", data);
      //need to add
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <PageWrapper
        header="Connect your CRM"
        description="Note : We use your business account credentials to login your CRM. We visit only the URL you provide to publish the demands"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium">Login Id</label>
            <input
              type="text"
              required
              {...register("username")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full border py-2.5 sm:py-3 ps-4 pe-10 block border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required
              />
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">CRM Link</label>
            <input
              type="text"
              required
              {...register("crmLink")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.crmLink && (
              <p className="text-red-500 text-sm">{errors.crmLink.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button>Check Credentials</Button>
          </div>
        </form>
      </PageWrapper>
      <NextButton nextPageUrl="/upload-data" text="Next" />
    </div>
  );
};

export default CrmLogin;
