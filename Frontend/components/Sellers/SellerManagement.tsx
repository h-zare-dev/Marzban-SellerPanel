"use client";
import axios, { AxiosError } from "axios";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";

import { useMyContext } from "@/context/MyContext";
import AddSeller from "./AddSeller";
import SellerGrid from "./SellerGrid";
import SellerType from "@/models/SellerType";
import Messages from "../General/Messages";

const SellerManagement = () => {
  const { user, config } = useMyContext();
  const [sellerList, setSellerList] = useState<SellerType[]>([]);
  const [loading, setLoading] = useState(false);

  type MessagesHandle = ElementRef<typeof Messages>;
  const refMessages = useRef<MessagesHandle>(null);

  const LaodSeller = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("api/sellers", config.BACKEND_URL);
      const resultSellers = await axios.get(url.toString(), {
        headers: { Authorization: "Bearer " + user.Token },
      });
      setSellerList(resultSellers.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [config.BACKEND_URL, user.Token]);

  useEffect(() => {
    if (user.Token !== "") LaodSeller();
  }, [LaodSeller, user.Token]);

  const onDeleteClick = async (seller: SellerType) => {
    setLoading(true);
    try {
      const url = new URL("api/seller/" + seller._id, config.BACKEND_URL);

      await axios.delete(url.toString(), {
        headers: { Authorization: "Bearer " + user.Token },
      });
      refMessages.current?.Show("success", "Agent Delete Successful!");
    } catch (error) {
      console.log(error);
    } finally {
      LaodSeller();
    }
  };

  const onDisableAccountClick = async (seller: SellerType) => {
    setLoading(true);
    try {
      const url = new URL(
        "api/disableseller/" + seller._id,
        config.BACKEND_URL
      );

      await axios.post(
        url.toString(),
        {},
        {
          headers: { Authorization: "Bearer " + user.Token },
        }
      );
      refMessages.current?.Show("success", "Agent Change Successful!");
    } catch (error) {
      console.log(error);
    } finally {
      LaodSeller();
    }
  };

  const onAddClick = async (seller: SellerType) => {
    setLoading(true);
    try {
      const url = new URL("api/seller", config.BACKEND_URL);

      await axios.post(url.toString(), seller, {
        headers: { Authorization: "Bearer " + user.Token },
      });
      refMessages.current?.Show("success", "Agent Insert Successful!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          const statusCode = axiosError.response.status;

          if (statusCode === 404) {
            refMessages.current?.Show(
              "error",
              "Invalid Marzban Account Information"
            );
          } else {
            console.log("Internal Server Error : ", error);
            refMessages.current?.Show(
              "error",
              "Internal Server Error! Please try again later."
            );
          }
        } else {
          console.log("No response received:", axiosError.message);
          refMessages.current?.Show("error", "No response from the server.");
        }
      } else {
        console.log("Unknown error:", error);
        refMessages.current?.Show("error", "An unknown error occurred.");
      }
    } finally {
      LaodSeller();
    }
  };

  return (
    <div className="row w-100 border border-solid-1 border-secondary.light rounded py-2">
      <div className="col-12">
        <Messages ref={refMessages}></Messages>
        <AddSeller onAdding={onAddClick}></AddSeller>
        <SellerGrid
          Sellers={sellerList}
          Loading={loading}
          onDeleting={onDeleteClick}
          onDisableAccount={onDisableAccountClick}
        />
      </div>
    </div>
  );
};

export default SellerManagement;
