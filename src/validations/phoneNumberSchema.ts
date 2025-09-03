import { z } from "zod";

//  validation schema
export const phoneSchema = z.object({
  countryCode: z.string().min(1, "Select a country code"),
  phoneNumber: z.string().refine((val) => {
    const numbers = val
      .split(", ")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    // console.log(numbers)
    if (numbers.length === 0) return false;
    return numbers.every((num) => /^\d{10}$/.test(num));
  }, "Each number must be 10 digits"),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;
