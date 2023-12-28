"use client";
import axios from "axios";
import { forwardRef, useEffect, useCallback, useState } from "react";

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
import CircleIcon from "@mui/icons-material/Circle";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import { useMyContext } from "@/context/MyContext";
import { copyTextToClipboard } from "@/utils/Helper";

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

interface PropsType {
  Loading: boolean;
  Rows: AccountType[];
  onDeleting: (row: AccountType) => void;
  onRenewing: (row: AccountType) => void;
  onDisabling: (row: AccountType) => void;
}

const AccountGrid = (props: PropsType) => {
  const [selectedLink, setSelectedLink] = useState("");

  const columns = [
    {
      headerName: "",
      field: "link",
      type: "actions",
      width: 70,
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
          key="renew"
          label="Renew"
          icon={<RenewIcon className="text-success" />}
          onClick={() => onRenewClick(params.row)}
        />,
      ],
    },
    { field: "username", headerName: "Username", width: 140 },
    { field: "note", headerName: "Note", width: 80 },
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
    {
      headerName: "",
      field: "delete",
      type: "actions",
      width: 80,
      getActions: (params: { row: AccountType }) => [
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={<DeleteIcon className="text-danger" />}
          onClick={() => onDeleteClick(params.row)}
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
    props.onRenewing(row);
  };

  const onDeleteClick = (row: AccountType) => {
    props.onDeleting(row);
  };

  const onDisableAccount = async (row: AccountType) => {
    props.onDisabling(row);
  };

  return (
    <DataGrid
      initialState={{
        pagination: { paginationModel: { pageSize: 100 } },
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      className="Grid"
      rows={props.Rows}
      columns={columns}
      loading={props.Loading}
    />
  );
};

export default AccountGrid;
