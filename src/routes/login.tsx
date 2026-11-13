import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Btn } from "@/components/site/ui";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Login — Justdial" }, { name: "description", content: "Sign in with your mobile number to save favourites, track enquiries and manage your business." },
    { property: "og:title", content: "Login — Justdial" }, { property: "og:description", content: "Sign in with your mobile number to save favourites, track enquiries and manage your business." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const nav = useNavigate();
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="w-full max-w-md rounded-[2rem] border bg-card p-8 shadow-lift">
        <h1 className="text-3xl font-extrabold">{step === "phone" ? "Welcome" : "Enter OTP"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{step === "phone" ? "Log in or sign up with your mobile number." : `We sent a 4-digit code to +91 ${phone}`}</p>
        {step === "phone" ? (
          <form onSubmit={(e) => { e.preventDefault(); if (!/^[6-9]\d{9}$/.test(phone)) return toast.error("Enter a valid 10-digit mobile number"); setStep("otp"); toast("Demo: use any 4 digits"); }} className="mt-6 space-y-4">
            <div className="flex h-12 overflow-hidden rounded-xl border border-input"><span className="grid place-items-center border-r px-3 font-semibold text-muted-foreground">+91</span><input autoFocus value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" aria-label="Mobile number" placeholder="Mobile number" className="flex-1 bg-transparent px-3 outline-none" /></div>
            <Btn type="submit" className="w-full">Send OTP</Btn>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (otp.length !== 4) return toast.error("Enter the 4-digit code"); toast.success("You're logged in (demo)"); nav({ to: "/" }); }} className="mt-6 space-y-4">
            <input autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" aria-label="OTP" placeholder="• • • •" className="h-14 w-full rounded-xl border border-input bg-background text-center font-display text-2xl tracking-[1em] outline-none" />
            <Btn type="submit" className="w-full">Verify & continue</Btn>
            <button type="button" onClick={() => setStep("phone")} className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground">Change number</button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</p>
      </div>
    </div>
  );
}
