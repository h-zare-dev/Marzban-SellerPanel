"use client";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DataGrid,
  GridActionsCellItem,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import RenewIcon from "@mui/icons-material/RecyclingOutlined";
import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/Check";
import CreditScoreRoundedIcon from "@mui/icons-material/CreditScoreRounded";
import CreditCardOffRoundedIcon from "@mui/icons-material/CreditCardOffRounded";
import GppMaybeRoundedIcon from "@mui/icons-material/GppMaybeRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import GppBadRoundedIcon from "@mui/icons-material/GppBadRounded";
import SafetyCheckRoundedIcon from "@mui/icons-material/SafetyCheckRounded";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import { useMyContext } from "@/context/MyContext";
import { copyTextToClipboard } from "@/utils/Helper";
import AddAccount from "./AddAccount";
import DeleteModal from "./DeleteModal";
import RenewModal from "./RenewModal";

interface AccountType {
  show: string;
  username: string;
  subscription_url: string;
  payed: string;
  data_limit: number;
  data_limit_string: string;
  used_traffic: number;
  used_traffic_string: string;
  expire: number;
  expire_string: string;
}

export default function AccountList() {
  const { user, config, setUser } = useMyContext();

  const [loading, setLoading] = useState(true);
  const [accountList, setAccountList] = useState<AccountType[]>([]);

  const [selectedLink, setSelectedLink] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountType>();

  type DeleteModalHandle = React.ElementRef<typeof DeleteModal>;
  const refDeleteModal = useRef<DeleteModalHandle>(null);

  type RenewModalHandle = React.ElementRef<typeof RenewModal>;
  const refRenewModal = useRef<RenewModalHandle>(null);

  const columns = [
    {
      headerName: "",
      field: "subscription_url",
      type: "actions",
      width: 120,
      getActions: (params: { row: AccountType }) => [
        <GridActionsCellItem
          key="link"
          label="Link"
          icon={
            params.row.username === selectedLink ? (
              <CheckIcon className="text-primary" />
            ) : (
              <LinkIcon className="text-primary" />
            )
          }
          onClick={() => onCopyLink(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={<DeleteIcon className="text-danger" />}
          onClick={() => onDeleteClick(params.row)}
        />,
        <GridActionsCellItem
          key="renew"
          label="Renew"
          icon={<RenewIcon className="text-success" />}
          onClick={() => onRenewClick(params.row)}
        />,
      ],
    },
    { field: "username", headerName: "Username", width: 140 },
    { field: "data_limit_string", headerName: "Limit", width: 110 },
    {
      field: "used_traffic_string",
      headerName: "Usage",
      width: 110,
      renderCell: (params: GridRenderCellParams<any, string>) =>
        RenderUsage(params.row),
    },
    { field: "expire_string", headerName: "Expire", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params: GridRenderCellParams<any, string>) =>
        RenderStatus(params.value),
    },
    {
      field: "payed",
      headerName: "Payment",
      width: 110,
      renderCell: (params: GridRenderCellParams<any, string>) =>
        RenderPayment(params.value),
    },
  ];

  const RenderStatus = (status: string | undefined) => {
    switch (status) {
      case "active":
        return (
          <span className="text-success">
            <GppGoodRoundedIcon></GppGoodRoundedIcon> {status}
          </span>
        );
      case "disabled":
        return (
          <span className="text-secondary">
            <GppBadRoundedIcon></GppBadRoundedIcon>
            {status}
          </span>
        );
      case "expired":
        return (
          <span className="text-primary">
            <SafetyCheckRoundedIcon></SafetyCheckRoundedIcon>
            {status}
          </span>
        );
      case "limited":
        return (
          <span className="text-danger">
            <GppMaybeRoundedIcon></GppMaybeRoundedIcon>
            {status}
          </span>
        );
    }
  };

  const RenderPayment = (payment: string | undefined) => {
    switch (payment) {
      case "Paid":
        return (
          <span className="text-success">
            <CreditScoreRoundedIcon></CreditScoreRoundedIcon>
            Paid
          </span>
        );
      case "Unpaid":
        return (
          <span className="text-secondary">
            <CreditCardOffRoundedIcon></CreditCardOffRoundedIcon>
            Unpaid
          </span>
        );
    }
  };

  const RenderUsage = (row: AccountType) => {
    return (
      <Box sx={{ width: "100%" }}>
        {row.used_traffic_string}
        <LinearProgress
          variant="determinate"
          value={(row.used_traffic / row.data_limit) * 100}
        />
      </Box>
    );
  };

  const onCopyLink = (row: AccountType) => {
    copyTextToClipboard(row.subscription_url);
    setSelectedLink(row.username);
  };

  const onRenewClick = (row: AccountType) => {
    if (row.payed !== "Payed") {
      setSelectedAccount(row);
      refRenewModal.current?.Show(row.username);
    }
  };

  const onDeleteClick = (row: AccountType) => {
    if (row.payed !== "Payed" && !row.used_traffic_string.includes("GB")) {
      setSelectedAccount(row);
      refDeleteModal.current?.Show(row.username);
    }
  };

  const LoadAccount = useCallback(async () => {
    try {
      StartLoading();
      let url = new URL(
        "api/marzban/accounts/" + user.Username,
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
  }, [config.BACKEND_URL, user.Token, user.Username]);

  useEffect(() => {
    if (user.Token !== "") LoadAccount();
  }, [LoadAccount, user.Token]);

  const BtnRefreh_Click = () => {
    LoadAccount();
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

  const RenewAccount = async () => {};

  const StartLoading = () => {
    setLoading(true);
  };

  return (
    <div className="container-fluid bg-primery">
      <AddAccount
        EndAdding={LoadAccount}
        StartAdding={StartLoading}
        Mode="Add"
      />
      <div className="row">
        <div className="col justify-content-end d-flex mt-1">
          <button className="btn border-0 " onClick={BtnRefreh_Click}>
            <AutorenewIcon className="text-success" />
          </button>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="ContainerGrid">
            <DataGrid
              className="Grid"
              rows={accountList}
              columns={columns}
              loading={loading}
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
