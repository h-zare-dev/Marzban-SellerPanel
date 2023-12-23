"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

import { useMyContext } from "@/context/MyContext";
import AccountList from "@/components/AccountList";

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser } = useMyContext();

  useEffect(() => {
    if (user.Token === "") router.push("/");
  }, [user.Token, router]);

  const BtnExit_Click = () => {
    setUser({ Token: "", IsAdmin: false, Username: "", Limit: 0 });
    router.push("/");
  };

  return (
    <div className="container-fluid ">
      <div className="row BgGrdColorizePurple justify-content-end d-flex">
        <div className="col-10 container d-inline-flex align-items-start py-1 ">
          <div className="row">
            <div className="col-12">
              <h6 className="text-white mx-3 py-1 ">Welcome {user.Username}</h6>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <h6 className="text-white d-flex py-1">
                Data Remaining:
                <label className="text-warning mx-1">
                  {user.Limit} <label className="text-white">GB</label>
                </label>
              </h6>
            </div>
          </div>
        </div>
        <div className="col-2  d-flex  justify-content-end justify-content-xm-center py-1">
          <button className="btn border-0" onClick={BtnExit_Click}>
            <PowerSettingsNewIcon className="text-white" />
          </button>
        </div>
      </div>
      <div className="row py-2">
        <div className="col">
          <AccountList></AccountList>
        </div>
        <div className="center">v1.4</div>
      </div>
    </div>
  );
}
