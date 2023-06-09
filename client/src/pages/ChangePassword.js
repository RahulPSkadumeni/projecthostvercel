import React, { useEffect } from "react";
import Homepage from "./Home/Home";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import OtpInput from "otp-input-react";
import { CgSpinner } from "react-icons/cg";
import "../../src/App.css";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import { checkPhone } from "../api/usersApi/user";
import { createJwt } from "../api/usersApi/user";
import { number } from "yup";
import { useNavigate } from "react-router-dom";
import { setLogin } from "./state";
import { useDispatch, useSelector } from "react-redux";
export default function ChangePassword() {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  if (user) {
    const userId = user._id;
  }
  // console.log(ph, "pppppppppppppppppppppppppppppppppp");

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);

  const handlePhoneNumber = () => {
    console.log("Inside handle phoneno", ph);
    checkPhone(ph).then((result) => {
      console.log(result, "poooooooooooooooooooooooooooooooooo");
      if (result.userExist) {
        onSignup();
      }
    });
  };

  const createToken = () => {
    console.log("create token inside otplogin:jsx");
    createJwt(ph).then((result) => {
      console.log(result);

      dispatch(
        setLogin({
          token: result.token,
          user: result.user,
        })
      );
      navigate("/");

      console.log("token creation completed");
    });
  };

  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // ...
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...
          },
        },
        auth
      );
    }
  }

  function onSignup() {
    setLoading(true);
    onCaptchVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+91" + ph;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sended successfully!");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }

  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        navigate(`/newPassword/${ph}`);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  const resendOTP = () => {
    setMinutes(1);
    setSeconds(30);
    handlePhoneNumber();
  };

  return (
    <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 ... flex items-center justify-center h-screen">
      <div>
        <Toaster toastOptions={{ duration: 4000 }} />
        <div id="recaptcha-container"></div>
        {user ? (
          <h2 className="text-center text-white font-medium text-2xl">
            <Homepage />
            {/* 👍 Login Success */}
          </h2>
        ) : (
          <div className="w- flex flex-col gap-4 rounded-lg p-4">
            <h1 className="text-center leading-normal text-white font-medium text-4xl mb-8">
              Welcome to Gamers-DEN
            </h1>
            {showOTP ? (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-lg">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-l text-white text-center "
                >
                  Enter your OTP
                </label>

                <div className="countdown-text">
                  {seconds > 0 || minutes > 0 ? (
                    <p>
                      Time Remaining: {minutes < 10 ? `0${minutes}` : minutes}:
                      {seconds < 10 ? `0${seconds}` : seconds}
                    </p>
                  ) : (
                    <p>Didn't recieve code?</p>
                  )}

                  <button
                    disabled={seconds > 0 || minutes > 0}
                    style={{
                      color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#FF5630",
                    }}
                    onClick={resendOTP}
                  >
                    Resend OTP
                  </button>
                </div>

                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autoFocus
                  className="opt-container "
                ></OtpInput>
                <button
                  onClick={onOTPVerify}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Verify OTP</span>
                </button>
              </>
            ) : (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsTelephoneFill size={40} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-l text-white text-center"
                >
                  Verify your phone number
                </label>
                <input
                  className=" py-2.5  rounded-lg !border-t-blue-gray-200 focus:!border-t-blue-500"
                  type="Number"
                  name="phone"
                  country={"in"}
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />

                <button
                  onClick={handlePhoneNumber}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send Code via SMS</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
