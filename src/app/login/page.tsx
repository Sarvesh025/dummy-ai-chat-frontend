"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import DarkModeToggle from "../../components/DarkModeToggle";
import { MessageCircle } from 'lucide-react';

const phoneSchema = z.object({
  country: z.string().min(1, "Select a country"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .trim(),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

interface Country {
  name: string;
  code: string;
  flag?: string;
}

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneData, setPhoneData] = useState<{ country: string; phone: string } | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpError, setOtpError] = useState("");
  const router = useRouter();

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all?fields=name,idd,flags")
      .then((res) => {
        const countries: Country[] = res.data
          .map((c: { name: { common: string }; idd?: { root?: string; suffixes?: string[] }; flags?: { svg?: string } }) => ({
            name: c.name.common,
            code: c.idd?.root ? c.idd.root + (c.idd.suffixes?.[0] || "") : "",
            flag: c.flags?.svg,
          }))
          .filter((c: Country) => c.code);
        setCountryList(countries.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => toast.error("Failed to fetch country data"));
  }, []);

  const phoneForm = useForm<{ country: string; phone: string }>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { country: "", phone: "" },
  });
  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const handlePhoneSubmit = (data: { country: string; phone: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhoneData(data);
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setStep("otp");
      toast.success("OTP sent successfully!");
    }, 1200);
  };

  const handleOtpSubmit = (data: { otp: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (data.otp !== generatedOtp) {
        setOtpError("Invalid OTP");
        toast.error("Invalid OTP");
        return;
      }
      setOtpError("");
      toast.success("OTP verified! Logging in...");
      // Create a random string and save in cookies
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      Cookies.set("auth_token", token, { expires: 1 }); // expires in 1 day
      localStorage.setItem("auth", JSON.stringify({ ...phoneData, loggedIn: true }));
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
       <header className="!bg-white dark:!bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="!bg-white dark:!bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gemini Chat</h1>
          </div>
          <div className="flex items-center gap-2">
           <DarkModeToggle/>
          </div>
        </div>
      </header>
      <div className="max-w-sm mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login / Signup</h1>
        {step === "phone" && (
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-800 dark:text-gray-200">Country</label>
              <select {...phoneForm.register("country")}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select country</option>
                {countryList.map((c) => (
                  <option key={`${c.name}-${c.code}`} value={c.code}>
                    {c.flag ? "" : null} {c.name} ({c.code})
                  </option>
                ))}
              </select>
              {phoneForm.formState.errors.country && (
                <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.country.message as string}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-gray-800 dark:text-gray-200">Phone Number</label>
              <div className="flex">
                <input
                  {...phoneForm.register("phone")}
                  type="tel"
                  placeholder="Phone number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.phone.message as string}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-800 dark:text-gray-200">Enter OTP</label>
              <input
                {...otpForm.register("otp")}
                type="text"
                maxLength={6}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white tracking-widest text-center text-lg placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="------"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-red-500 text-xs mt-1">{otpForm.formState.errors.otp.message as string}</p>
              )}
              {otpError && (
                <p className="text-red-500 text-xs mt-1">{otpError}</p>
              )}
              {/* Show the generated OTP for demo purposes */}
              <div className="mt-2 text-center text-blue-600 dark:text-blue-400 text-sm">OTP: {generatedOtp}</div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 