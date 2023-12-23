"use client";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { useMyContext } from "@/context/MyContext";
import AddAccount from "./AddAccount";
import DeleteModal from "./DeleteModal";
import RenewModal from "./RenewModal";
import AccountGrid from "./AccountGrid";

interface AccountType {
  show: string;
  username: string;
  package: string;
  subscription_url: string;
  online: string;
  online_at: string;
  payed: string;
  data_limit: number;
  data_limit_string: string;
  used_traffic: number;
  used_traffic_string: string;
  expire: number;
  expire_string: string;
  status: string;
}

interface TariffType {
  _id: string;
  Title: string;
  DataLimit: number;
  Duration: number;
  IsFree: boolean;
  IsVisible: boolean;
}

export default function AccountList() {
  const { user, config, setUser } = useMyContext();

  const [loading, setLoading] = useState(false);
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountType>();

  type DeleteModalHandle = React.ElementRef<typeof DeleteModal>;
  const refDeleteModal = useRef<DeleteModalHandle>(null);

  type RenewModalHandle = React.ElementRef<typeof RenewModal>;
  const refRenewModal = useRef<RenewModalHandle>(null);

  const onRenewClick = (row: AccountType) => {
    if (
      row.payed == "Paid" &&
      (row.status == "expired" || row.status == "limited")
    ) {
      setSelectedAccount(row);
      refRenewModal.current?.Show(row.username);
    }
  };

  const onDeleteClick = (row: AccountType) => {
    if (row.payed !== "Paid" && row.used_traffic < 1.2 * 1024 * 1024 * 1024) {
      setSelectedAccount(row);
      refDeleteModal.current?.Show(row.username);
    }
  };

  const onDisabledClick = async (row: AccountType) => {
    if (row.status == "active" || row.status == "disabled")
      try {
        StartLoading();

        let url = new URL(
          "api/marzban/disableaccount/" + row.username,
          config.BACKEND_URL
        );
        await axios.post(
          url.toString(),
          {
            status: row.status == "active" ? "disabled" : "active",
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

  const OnAddClick = async (tariff: TariffType) => {
    if (user.Limit >= tariff.DataLimit)
      try {
        StartLoading();
        const url = new URL("api/marzban/account", config.BACKEND_URL);

        await axios.post(
          url.toString(),
          {
            username: user.Username,
            tariffId: tariff._id,
          },
          {
            headers: { Authorization: "Bearer " + user.Token },
          }
        );
        if (!tariff.IsFree) user.Limit -= tariff.DataLimit;
        setUser({ ...user, Limit: user.Limit });
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
          <div className="ContainerGrid">
            <AccountGrid
              Rows={accountList}
              Loading={loading}
              onDeleting={onDeleteClick}
              onDisabling={onDisabledClick}
              onRenewing={onRenewClick}
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
