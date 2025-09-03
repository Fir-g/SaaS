import NextButton from "@/components/ui/next-button";
import PageWrapper from "@/components/ui/page-wrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getBlacklistedContacts, postBlacklistedNumbers } from "@/services/contactService";
import { BlacklistedContact } from "@/types/contacts";
import ContactList from "./contact-list";
import MembersModal from "./members-modal";
import { useForm } from "react-hook-form";
import { phoneSchema, PhoneFormData } from "@/validations/phoneNumberSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const SelectTeamMembers = () => {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [fetchedContacts, setFetchedContacts] = useState<string[]>([]);
  const [manualContacts, setManualContacts] = useState<string[]>([]);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const combinedContacts = [...fetchedContacts, ...manualContacts];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tenant_id = import.meta.env.VITE_TENANT_ID || "FT";

  const {
    register,
    handleSubmit,
    setError: setFormError,
    clearErrors,
    reset,
    setValue,
    formState,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const handleNextClick = async () => {
    if (combinedContacts.length > 0) {
      try {
        setLoading(true);
        const token = await getClerkBearer();
        await postBlacklistedNumbers(tenant_id, combinedContacts, token);
        console.log("Successfully added contacts to blacklist");
      } catch (error) {
        setError(`Error updating blacklist: ${error}`);
      } finally {
        setLoading(false);
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
    const digits = e.target.value.replace(/\D/g, ""); // remove non-digits
    const grouped = digits.match(/.{1,10}/g) ?? [];

    const uniqueNumbers: string[] = [];
    const seen = new Set<string>();

    grouped.forEach((num) => {
      if (!seen.has(num)) {
        seen.add(num);
        uniqueNumbers.push(num);
      } else {
        alert("Duplicate entry detected");
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

    contactInput.forEach((contact) => {
      const phNumber = data.countryCode + contact;
      const isPresent = combinedContacts.find((num) => num === phNumber);
      if (!isPresent) {
        setManualContacts((prev) => [...prev, phNumber]);
      } else {
        setFormError("phoneNumber", {
          type: "manual",
          message: "Contact already present in list",
        });
      }
    });
  };

  const handleViewInModal = () => {
    setViewModal(!viewModal);
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ countryCode: "+91", phoneNumber: "" });
    }
  }, [formState, reset]);

  useEffect(() => {
    const fetchBlacklistedNumbers = async () => {
      try {
        setLoading(true);
        const token = await getClerkBearer();
        const response: BlacklistedContact[] = await getBlacklistedContacts(token);
        setFetchedContacts(
          response.map(({ phone_number }) => phone_number) || []
        );
      } catch (error) {
        console.error("Error fetching blacklisted numbers:", error);
        setError("Failed to load existing blacklisted numbers");
      } finally {
        setLoading(false);
      }
    };
    fetchBlacklistedNumbers();
  }, [getClerkBearer]);

  return (
    <div className="flex flex-col w-full h-full py-6 px-4 md:px-12 pt-20">
      <PageWrapper
        header="Configure team members"
        description="We value your privacy and data and understand that it might be
            uncomfortable to have an AI agent scanning your WhatsApp. We provide
            you full freedom to select & mark which numbers or groups you want
            us to skip reading in our analysis."
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col md:flex-row gap-4"
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
              
              <div className="w-full md:flex-1">
                <label
                  htmlFor="phonenumber"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number
                </label>
                <textarea
                  className="w-full border px-3 py-2 rounded resize-none max-h-[40px]"
                  onChange={handleAutoFormat}
                  ref={(e) => {
                    register("phoneNumber").ref(e);
                    textareaRef.current = e;
                  }}
                  rows={1}
                  placeholder="Enter 10-digit numbers (comma separated)"
                  id="phonenumber"
                />
              </div>
              
              <div className="w-full md:w-auto">
                <p className="text-transparent cursor-default mb-1">Add Contact</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-[40px] disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
            
            {errors.countryCode && (
              <p className="text-red-500 text-sm mt-1">{errors.countryCode.message}</p>
            )}
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-gray-800 text-xl font-semibold pb-4">
                Excluded contacts ({combinedContacts.length})
              </h3>
              {combinedContacts.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleViewInModal}
                  className="text-sm hover:no-underline text-blue-700 hover:text-blue-500"
                >
                  View all
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" className="ml-1" />
                </Button>
              )}
            </div>

            {combinedContacts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">
                  No contacts added yet. Add phone numbers above to exclude them from WhatsApp analysis.
                </p>
              </div>
            ) : (
              <div className="h-60 overflow-y-auto rounded-lg border">
                <ContactList
                  contacts={combinedContacts.slice(0, 5)} // Show only first 5
                  handleRemoveNumber={handleRemoveNumber}
                />
                {combinedContacts.length > 5 && (
                  <div className="p-3 bg-gray-50 border-t text-center">
                    <button
                      onClick={handleViewInModal}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View {combinedContacts.length - 5} more contacts...
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>

      {viewModal && (
        <MembersModal handleViewModal={handleViewInModal}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <ContactList
              contacts={combinedContacts}
              handleRemoveNumber={handleRemoveNumber}
            />
          </div>
        </MembersModal>
      )}

      <div className="mt-auto pt-8">
        <NextButton
          handleClick={handleNextClick}
          nextPageUrl="/whatsapp/group"
          text="Next"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SelectTeamMembers;