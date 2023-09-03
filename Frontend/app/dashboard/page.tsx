"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

import { useMyContext } from "@/context/MyContext";
import AccountList from "@/components/AccountList";

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser } = useMyContext();

  useEffect(() => {
    if (user.Token === "") router.push("/");
  }, [user.Token, router]);

  const BtnExit_Click = () => {
    setUser({ Token: "", Username: "" });
  };

  return (
    <div className="container-fluid ">
      <div className="row BgGrdColorizePurple justify-content-end">
        <div className="col-10 d-flex  justify-content-start py-1">
          <h6 className="text-white px-3 py-1">Welcome {user.Username}</h6>
        </div>
        <div className="col-2  d-flex  justify-content-end justify-content-xm-center py-1">
          <button className="btn border-0" onClick={BtnExit_Click}>
            <FontAwesomeIcon className="text-white" icon={faPowerOff} />
          </button>
        </div>
      </div>
      <div className="row py-2">
        <div className="col">
          <AccountList></AccountList>
        </div>
      </div>
    </div>
  );
}
