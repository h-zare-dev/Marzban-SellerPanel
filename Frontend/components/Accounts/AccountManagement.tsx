"use client";
import axios from "axios";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";

import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { useMyContext } from "@/context/MyContext";
import AddAccount from "./AddAccount";
import DeleteModal from "./DeleteModal";
import RenewModal from "./RenewModal";
import AccountGrid from "./AccountGrid";
import AccountType from "@/models/AccountType";
import TariffType from "@/models/TariffType";
import Messages from "../General/Messages";

export default function AccountManagement() {
  const { user, config, setUser } = useMyContext();

  const [loading, setLoading] = useState(false);
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountType>();

  type DeleteModalHandle = ElementRef<typeof DeleteModal>;
  const refDeleteModal = useRef<DeleteModalHandle>(null);

  type RenewModalHandle = ElementRef<typeof RenewModal>;
  const refRenewModal = useRef<RenewModalHandle>(null);

  type MessagesHandle = ElementRef<typeof Messages>;
  const refMessages = useRef<MessagesHandle>(null);

  const onRenewClick = (account: AccountType) => {
    const paid =
      accountList.filter(
        (acc) => acc.username == account.username && acc.payed === "Unpaid"
      ).length == 0;
    if (
      (paid || config.RENEW_FORCE_TO_PAID?.toUpperCase() !== "YES") &&
      (account.status == "expired" || account.status == "limited") &&
      account.data_limit / (1024 * 1024 * 1024) <= user.Limit
    ) {
      setSelectedAccount(account);
      refRenewModal.current?.Show(account.username);
    }
  };

  const onDeleteClick = (account: AccountType) => {
    const ignore = config.IGNORE_TRAFFIC_TO_REMOVE
      ? +config.IGNORE_TRAFFIC_TO_REMOVE
      : 1.2;
    if (
      account.payed !== "Paid" &&
      (user.IsAdmin || account.used_traffic < +ignore * 1024 * 1024 * 1024)
    ) {
      setSelectedAccount(account);
      refDeleteModal.current?.Show(account.username);
    }
  };

  const onDisabledClick = async (account: AccountType) => {
    if (account.status == "active" || account.status == "disabled")
      try {
        StartLoading();

        let url = new URL(
          "api/marzban/disableaccount/" + account.username,
          config.BACKEND_URL
        );
        await axios.post(
          url.toString(),
          {
            status: account.status == "active" ? "disabled" : "active",
          },
          {
            headers: { Authorization: "Bearer " + user.Token },
          }
        );
      } catch (error) {
        console.log(error);
      } finally {
        LoadAccount();
      }
  };

  const onPaymentClick = async (account: AccountType) => {
    if (user.IsAdmin)
      try {
        StartLoading();

        let url = new URL("api/payaccount/" + account.id, config.BACKEND_URL);
        await axios.post(url.toString(), {
          headers: { Authorization: "Bearer " + user.Token },
        });
      } catch (error) {
        console.log(error);
      } finally {
        LoadAccount();
      }
  };

  const OnAddClick = async (tariff: TariffType, note: string) => {
    if (user.Limit >= tariff.DataLimit)
      try {
        StartLoading();
        const url = new URL("api/marzban/account", config.BACKEND_URL);

        await axios.post(
          url.toString(),
          {
            username: user.Username,
            note: note,
            tariffId: tariff._id,
          },
          {
            headers: { Authorization: "Bearer " + user.Token },
          }
        );
        if (!tariff.IsFree) user.Limit -= tariff.DataLimit;
        setUser({ ...user, Limit: user.Limit });
        refMessages.current?.Show("success", "Account Added Successful!");
      } catch (error) {
        console.log(error);
      } finally {
        LoadAccount();
      }
  };

  const LoadAccount = useCallback(
    async (IsAll: boolean = false) => {
      try {
        StartLoading();
        let url = new URL(
          `api/marzban/accounts/${user.Username}/${IsAll}/${0}/${10}`,
          config.BACKEND_URL
        );
        const resultAccounts = await axios.get(url.toString(), {
          headers: { Authorization: "Bearer " + user.Token },
        });
        const accounts = resultAccounts.data;
        setAccountList(accounts);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [config.BACKEND_URL, user.Token, user.Username]
  );

  useEffect(() => {
    if (user.Token !== "") LoadAccount();
  }, [LoadAccount, user.Token]);

  const UnFilter_Click = () => {
    LoadAccount(true);
  };

  const DeleteAccount = async () => {
    if (selectedAccount)
      try {
        StartLoading();

        const url = new URL(
          "api/marzban/account/" + selectedAccount?.username,
          config.BACKEND_URL
        );

        await axios.delete(url.toString(), {
          headers: { Authorization: "Bearer " + user.Token },
        });

        user.Limit += selectedAccount?.data_limit / (1024 * 1024 * 1024);
        setUser({ ...user, Limit: user.Limit });
      } catch (error) {
        console.log(error);
      } finally {
        LoadAccount();
      }
  };

  const RenewAccount = async (username: string, tariffId: string) => {
    if (selectedAccount)
      try {
        StartLoading();

        const url = new URL(
          "api/marzban/renewaccount/" + user.Username,
          config.BACKEND_URL
        );

        await axios.post(
          url.toString(),
          {
            username: username,
            tariffId: tariffId,
          },
          {
            headers: { Authorization: "Bearer " + user.Token },
          }
        );

        user.Limit -= selectedAccount?.data_limit / (1024 * 1024 * 1024);
        setUser({ ...user, Limit: user.Limit });
      } catch (error) {
        console.log(error);
      } finally {
        LoadAccount();
      }
  };

  const StartLoading = () => {
    setLoading(true);
  };

  return (
    <div className="container-fluid bg-primery">
      <AddAccount onAdding={OnAddClick} Mode="Add" />
      <div className="row">
        <div className="col justify-content-end d-flex mt-1">
          <button
            className="btn border-2 border border-success p-1"
            onClick={UnFilter_Click}
          >
            <FilterAltOffIcon
              sx={{ fontSize: "30px" }}
              className="text-success  "
            />
          </button>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <Messages ref={refMessages}></Messages>
          <div className="ContainerGrid">
            <AccountGrid
              Accounts={accountList}
              Loading={loading}
              onDeleting={onDeleteClick}
              onDisabling={onDisabledClick}
              onRenewing={onRenewClick}
              onPaying={onPaymentClick}
            />
          </div>
        </div>
      </div>
      <DeleteModal
        DeletingHandler={DeleteAccount}
        ref={refDeleteModal}
      ></DeleteModal>
      <RenewModal RenewHandler={RenewAccount} ref={refRenewModal}></RenewModal>
    </div>
  );
}
