"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { useMyContext } from "@/context/MyContext";

interface TariffType {
  _id: string;
  Title: string;
  DataLimit: number;
  Duration: number;
}

export default function AddAccount(props: {
  StartAdding: () => void;
  EndAdding: () => void;
  Mode: string;
}) {
  const { user, config, setUser } = useMyContext();
  const [tariffList, setTariffList] = useState<TariffType[]>([]);
  const selectTariff = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const LaodTariff = async () => {
      try {
        const url = new URL("api/tariffs", config.BACKEND_URL);
        const resultTariff = await axios.get(url.toString());
        setTariffList(resultTariff.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (user.Token !== "") LaodTariff();
  }, [config.BACKEND_URL, user.Token]);

  const BtnAdd_Click = async () => {
    props.StartAdding();

    if (selectTariff.current) {
      const tariffId = selectTariff.current?.value;

      const dataLimit = tariffList.filter((t) => t._id == tariffId)[0]
        .DataLimit;

      if (user.Limit >= dataLimit)
        try {
          const url = new URL("api/marzban/account", config.BACKEND_URL);

          await axios.post(
            url.toString(),
            {
              username: user.Username,
              tariffId: tariffId,
            },
            {
              headers: { Authorization: "Bearer " + user.Token },
            }
          );
          user.Limit -= dataLimit;
          setUser({ ...user, Limit: user.Limit });
          console.log("Account Added!", user.Limit);
        } catch (error) {
          console.log(error);
        }
      props.EndAdding();
    }
  };

  const FillTariffs = () => {
    if (tariffList)
      return tariffList.map((tariff: TariffType) => {
        return (
          <option key={tariff?._id} value={tariff?._id}>
            {tariff?.Title}
          </option>
        );
      });
  };

  console.log("AddAccount Rendering!");

  return props.Mode == "Add" ? (
    <div className="row w-100 ">
      <div className="col-12">
        <div className="row">
          <div
            className="col-sm-5  justify-content-start d-flex mt-1 mx-1"
            id="divDrop"
          >
            <select
              name="tariffList"
              id="tariffList"
              className="rounded-2 BorderPurple border-2 p-2  tariffDrop w-100"
              ref={selectTariff}
            >
              {FillTariffs()}
            </select>
          </div>
          <div className="col-sm-6  d-flex mt-1 mx-1" id="divButton">
            <button
              onClick={BtnAdd_Click}
              className="btn btnAdd w100px BgGrdColorizePurple text-white border-1 BorderPurple  "
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="container-fluid">
      <div className="row">
        <div
          className="col-12  justify-content-start d-flex mt-1 mx-1"
          id="divDrop"
        >
          <select
            name="tariffList"
            id="tariffList"
            className="rounded-2 border-dark border-2  p-2  tariffDrop w-100"
            ref={selectTariff}
          >
            {FillTariffs()}
          </select>
        </div>
      </div>
    </div>
  );
}
