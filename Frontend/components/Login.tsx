"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Image } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { useMyContext } from "@/context/MyContext";

export default function Login() {
  const router = useRouter();
  const { setUser, config, setConfig } = useMyContext();
  const [Loading, setLoading] = useState(false);
  const UsernameText = useRef<HTMLInputElement | null>(null);
  const PasswordText = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getConfig = async () => {
      const result = await axios("/api/getconfig");
      setConfig(result.data);
    };
    getConfig();
  }, [setConfig]);

  const Login_Click = async () => {
    if (!Loading) {
      setLoading(true);
      // try {
      if (config.BACKEND_URL) {
        const url = new URL("api/marzban/logintomarzban", config.BACKEND_URL);

        const resultAccounts = await axios.post(url.toString(), {
          username: UsernameText.current?.value,
          password: PasswordText?.current?.value,
        });
        if (resultAccounts.status == 200 && UsernameText.current?.value) {
          setUser({
            Username: resultAccounts.data.Username,
            Token: resultAccounts.data.Token,
          });
          router.push("/dashboard");
          setLoading(false);
        }
      }
      // } catch (error) {
      //   console.log(error);
      // }
    }
  };
  return (
    <div className="firstdiv col-6 d-flex flex-column justify-content-center h-100 border border-1 border-muted  rounded-3 shadow shadow-lg ">
      <Image
        id="imgPreview88"
        className=" img-fluid align-self-center HoverRescale rounded-3 shadow"
        src="../logo.gif"
        alt="logo"
        height="120vh"
        width="120vw"
      />

      <h4 className="HeadLine ExploreDiv HoverRescale mt-3 FullPurpleColor ">
        {config.CHANNEL_NAME}
      </h4>
      <input
        type="text"
        name="Login"
        id="txtusername"
        ref={UsernameText}
        className="rounded-1 border-1 BorderPurple mt-1 p-1 FullPurpleColor"
      />
      <input
        type="password"
        name="Password"
        id="txtpassword"
        ref={PasswordText}
        className="rounded-1 border-1 BorderPurple mt-1 p-1 FullPurpleColor"
      />

      <Button
        variant="primary"
        onClick={Login_Click}
        className="rounded-1 border-1  BorderPurple btn-success  mt-1 text-dark  text-uppercase text-white BtnGrdPurple p-1"
      >
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className={Loading ? "mx-1" : "visually-hidden"}
        />
        {Loading ? "" : "LOGIN"}
      </Button>
    </div>
  );
}
