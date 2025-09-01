import { useForm } from "react-hook-form";
import { phoneSchema, PhoneFormData } from "@/validations/phoneNumberSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";

import NextButton from "@/components/ui/next-button";
import PageWrapper from "@/components/ui/page-wrapper";
import { ApiService } from "@/services/api";
import config from '@/config';
import { Button } from "@/components/ui/button";
import { getBlacklistedContacts } from "@/services/contactService";
import { BlacklistedContact } from "@/types/contacts";
import ContactList from "./contact-list";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

// Create an instance of ApiService for member services
class MemberApiService extends ApiService {
  private token = config.service_url.token;

  async postMemberData<T>(endpoint: string, data?: any): Promise<T> {
    return this.post<T>(endpoint, data, this.token, false);
  }
}

const memberApi = new MemberApiService();

const SelectTeamMembers = () => {
  const [fetchedContacts, setFetchedContacts] = useState<string[]>([]);
  const [manualContacts, setManualContacts] = useState<string[]>([]);
  const [viewModal, setviewModal] = useState<boolean>(false);

  let combinedContacts = [...fetchedContacts, ...manualContacts];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tenant_id = import.meta.env.VITE_TENANT_ID;

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    setValue,
    formState,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const handleNextClick = async () => {
    // console.log(combinedContacts);

    if (combinedContacts.length > 0) {
      try {
        await memberApi.postMemberData("/sqldb/blacklist", {
          tenant_id: tenant_id,
          phone_numbers: combinedContacts,
        });
        console.log("successfully added contacts to blacklist");
      } catch (error) {
        throw new Error(`Error fetching blacklisted numbers: ${error}`);
      }
    }
  };

  const handleRemoveNumber = (num: string) => {
    if (manualContacts.includes(num)) {
      setManualContacts((prev) => prev.filter((contact) => contact !== num));
    } else if (fetchedContacts.includes(num)) {
      setFetchedContacts((prev) => prev.filter((contact) => contact !== num));
    }
  };

  const handleAutoFormat = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    clearErrors("phoneNumber");
    // console.log(e.target.value)
    const digits = e.target.value.replace(/\D/g, ""); // remove non-digits
    const grouped = digits.match(/.{1,10}/g) ?? [];

    const uniqueNumbers: string[] = [];
    const seen = new Set<string>();

    grouped.forEach((num) => {
      if (!seen.has(num)) {
        seen.add(num);
        uniqueNumbers.push(num);
      } else {
        alert("duplicate entry");
      }
    });

    const formatted = uniqueNumbers.join(", ");
    setValue("phoneNumber", formatted);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const onSubmit = (data: PhoneFormData) => {
    const contactInput = data.phoneNumber.split(", ");

    contactInput.map((contact) => {
      const phNumber = data.countryCode + contact;
      const isPresent = combinedContacts.find((num) => num === phNumber);
      !isPresent
        ? setManualContacts((prev) => [...prev, phNumber])
        : setError("phoneNumber", {
            type: "manual",
            message: "Contact already present in list",
          });
    });
  };

  const handleViewInModal = () => {
    setviewModal(!viewModal);
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ countryCode: "+91", phoneNumber: "" });
    }
  }, [formState, reset]);

  useEffect(() => {
    const fetchBlacklistedNumbers = async () => {
      try {
        const response: BlacklistedContact[] = await getBlacklistedContacts();
        setFetchedContacts(
          response.map(({ phone_number }) => phone_number) || []
        );
      } catch (error) {
        console.log("Error");
        throw new Error("error fetching blacklisted numbers");
      }
    };
    fetchBlacklistedNumbers();
  }, []);

  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <PageWrapper
        header="Configure team members"
        description=" We value your privacy and data and understand that it might be
            uncomfortable to have an AI agent scanning your WhatsApp. We provide
            you full freedom to select & mark which numbers or groups you want
            us to skip reading in our analysis."
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex md:flex-nowrap gap-4"
          >
            <div className="w-full md:w-1/5">
              <label
                htmlFor="countrycode"
                className="block text-sm font-medium mb-1"
              >
                Country Code
              </label>
              <select
                defaultValue={"+91"}
                {...register("countryCode")}
                className="border px-3 py-2 rounded w-full cursor-pointer"
                required
                id="countrycode"
              >
                <option value="+91">+91 (India)</option>
              </select>
            </div>
            <div className="w-full md:flex-1 ">
              <label
                htmlFor="phonenumber"
                className="block text-sm font-medium mb-1"
              >
                Phone Number
              </label>
              <textarea
                // min-h-[40px] max-h-[96px]
                className="w-full border px-3 py-2 rounded resize-none max-h-[40px]"
                onChange={handleAutoFormat}
                ref={(e) => {
                  register("phoneNumber").ref(e);
                }}
                rows={1}
                placeholder="Enter 10-digit numbers"
                id="phonenumber"
              />
            </div>
            <div className="w-full md:w-auto ">
              <p className="text-transparent cursor-default">Add Contact</p>
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-[40px]"
              >
                Add Contact
              </button>
            </div>
          </form>
          {errors.countryCode && (
            <p className="text-red-500">{errors.countryCode.message}</p>
          )}
          {errors.phoneNumber && (
            <p className="text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between ">
            <h3 className="text-gray-800 text-xl font-semibold pb-4">
              Excluded contacts
            </h3>
            <Button
              variant="ghost"
              onClick={handleViewInModal}
              className="text-sm hover:no-underline text-blue-700 hover:text-blue-500"
            >
              View all
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={"sm"} />
            </Button>
          </div>

          {
            combinedContacts.length === 0 ? (
              <p className="text-gray-500 text-sm pt-6">
                No contacts added yet.
              </p>
            ) : (
              //  viewModal ? (
              //   <MembersModal handleViewModal={handleViewInModal}>
              //     <div className="h-full overflow-y-scroll rounded-lg">
              //       <ContactList
              //         contacts={combinedContacts}
              //         handleRemoveNumber={handleRemoveNumber}
              //       />
              //     </div>
              //   </MembersModal>
              // ) : (
              <div className="h-60 overflow-y-scroll rounded-lg">
                <ContactList
                  contacts={combinedContacts}
                  handleRemoveNumber={handleRemoveNumber}
                />
              </div>
            )
            //  )
          }
        </div>
      </PageWrapper>

      <NextButton
        handleClick={handleNextClick}
        nextPageUrl="/whatsapp/group"
        text="Next"
      />
    </div>
  );
};

export default SelectTeamMembers;
