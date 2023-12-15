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

import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
// import ChecklistIcon from "@mui/icons-material/Checklist";
// import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
// import FactCheckIcon from "@mui/icons-material/FactCheck";
// import AutorenewIcon from "@mui/icons-material/Autorenew";
// import ViewListIcon from "@mui/icons-material/ViewList";
// import ListIcon from "@mui/icons-material/List";

import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/Check";
import CreditScoreRoundedIcon from "@mui/icons-material/CreditScoreRounded";
import CreditCardOffRoundedIcon from "@mui/icons-material/CreditCardOffRounded";
import GppMaybeRoundedIcon from "@mui/icons-material/GppMaybeRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import GppBadRoundedIcon from "@mui/icons-material/GppBadRounded";
import SafetyCheckRoundedIcon from "@mui/icons-material/SafetyCheckRounded";
import CircleIcon from "@mui/icons-material/Circle";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import { useMyContext } from "@/context/MyContext";
import { copyTextToClipboard } from "@/utils/Helper";
import AddAccount from "./AddAccount";
import DeleteModal from "./DeleteModal";
import RenewModal from "./RenewModal";

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

export default function AccountList() {
  const { user, config, setUser } = useMyContext();

  const [loading, setLoading] = useState(false);
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
      width: 180,
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
        <GridActionsCellItem
          key="disable"
          label="disable"
          icon={
            params.row.status === "disabled" ? (
              <ToggleOffIcon
                className="text-secondry "
                sx={{ fontSize: "35px" }}
              />
            ) : (
              <ToggleOnIcon
                sx={{ fontSize: "35px" }}
                className="text-success "
              />
            )
          }
          onClick={() => onDisableAccount(params.row)}
        />,
      ],
    },
    { field: "username", headerName: "Username", width: 140 },
    {
      field: "online",
      headerName: "",
      width: 20,
      renderCell: (params: GridRenderCellParams<any, string>) =>
        RenderOnline(params.value),
    },
    { field: "online_at", headerName: "Online", width: 180 },
    { field: "package", headerName: "Package", width: 170 },
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
      field: "sub_updated_at",
      headerName: "Subscription Last Update",
      width: 180,
    },
    {
      field: "sub_last_user_agent",
      headerName: "Subscription Last App",
      width: 180,
    },
    {
      field: "payed",
      headerName: "Payment",
      width: 110,
      renderCell: (params: GridRenderCellParams<any, string>) =>
        RenderPayment(params.value),
    },
  ];

  const RenderOnline = (online: string | undefined) => {
    switch (online) {
      case "Online":
        return (
          <span className="text-success  ">
            <CircleIcon className="w-100 border border-3 border-success rounded-circle"></CircleIcon>
          </span>
        );
      case "Offline":
        return (
          <span className="text-danger  ">
            <CircleIcon className="w-100 border border-3 border-danger rounded-circle "></CircleIcon>
          </span>
        );
      case "Never":
        return (
          <span className="text-warning">
            <CircleIcon className="w-100 border border-3 border-secondary rounded-circle"></CircleIcon>
          </span>
        );
    }
  };

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

  const onDisableAccount = async (row: AccountType) => {
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

  const BtnRefreh_Click = () => {
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

        user.Limit += selectedAccount?.data_limit / (1024 * 1024 * 1024);
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
      <AddAccount
        EndAdding={LoadAccount}
        StartAdding={StartLoading}
        Mode="Add"
      />
      <div className="row">
        <div className="col justify-content-end d-flex mt-1">
          <button
            className="btn border-2 border border-success p-1"
            onClick={BtnRefreh_Click}
          >
            {/* <AutorenewIcon className="text-success" /> */}
            <FilterAltOffIcon
              sx={{ fontSize: "30px" }}
              className="text-success  "
            />
            {/* <ChecklistIcon className="text-success" />
            <ChecklistRtlIcon className="text-success" />
            <FactCheckIcon className="text-success" />
            <ViewListIcon className="text-success" />
            <ListIcon className="text-success" /> */}
          </button>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="ContainerGrid">
            <DataGrid
              initialState={{
                pagination: { paginationModel: { pageSize: 100 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
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
