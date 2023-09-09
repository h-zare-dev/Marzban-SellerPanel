"use client";
import axios from "axios";
import { Fragment, useCallback, useEffect, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/Check";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

import { useMyContext } from "@/context/MyContext";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import AddAccount from "./AddAccount";
import { copyTextToClipboard } from "@/utils/Helper";

interface AccountType {
  username: string;
  subscription_url: string;
  payed: string;
  used_traffic: string;
}

export default function AccountList() {
  const { user, config } = useMyContext();

  const [accountList, setAccountList] = useState<AccountType[]>([]);

  const [selectedCopy, setSelectedCopy] = useState("");
  const [selectedDelete, setSelectedDelete] = useState("");
  const [loading, setLoading] = useState(true);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = async () => setShow(true);

  const columns = [
    {
      headerName: "",
      field: "subscription_url",
      type: "actions",
      width: 100,
      getActions: (params: { row: AccountType }) => [
        <GridActionsCellItem
          key="link"
          label="Link"
          icon={
            params.row.username === selectedCopy ? (
              <CheckIcon className="text-success" />
            ) : (
              <LinkIcon />
            )
          }
          onClick={() => onCopyLink(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={
            <div className="text-danger">
              <DeleteIcon />
            </div>
          }
          onClick={() => onDeleteClick(params.row.username)}
        />,
      ],
    },
    { field: "username", headerName: "Username", width: 140 },
    { field: "data_limit", headerName: "Limit", width: 110 },
    { field: "used_traffic", headerName: "Usage", width: 110 },
    { field: "expire", headerName: "Expire", width: 120 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "payed", headerName: "Payed", width: 110 },
  ];

  const LaodAccount = useCallback(async () => {
    try {
      setLoading(true);
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
    if (user.Token !== "") LaodAccount();
  }, [LaodAccount, user.Token]);

  const BtnRefreh_Click = () => {
    LaodAccount();
  };

  const onCopyLink = (row: { username: string; subscription_url: string }) => {
    copyTextToClipboard(row.subscription_url);
    setSelectedCopy(row.username);
  };

  const onDeleteClick = async (username: string) => {
    const account = accountList.filter(
      (account) => account.username === username
    );

    if (
      account[0].payed !== "Payed" &&
      !account[0].used_traffic.includes("GB")
    ) {
      handleShow();
      setSelectedDelete(username);
    }
  };

  const btnNo_Click = () => {
    handleClose();
  };

  const btnYes_Click = async () => {
    handleClose();
    try {
      setLoading(true);
      const url = new URL(
        "api/marzban/account/" + selectedDelete,
        config.BACKEND_URL
      );

      await axios.delete(url.toString(), {
        headers: { Authorization: "Bearer " + user.Token },
      });
    } catch (error) {
      console.log(error);
    }
    await LaodAccount();
  };

  const AddingHandler = () => {
    setLoading(true);
  };

  const AddedHandler = () => {
    LaodAccount();
  };

  return (
    <Fragment>
      <Modal
        className="border border-1   shadow rounded-3"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-danger text-white ">
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure to delete account?</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button variant="danger" className="w100px" onClick={btnYes_Click}>
            YES
          </Button>
          <Button variant="success" className="w100px" onClick={btnNo_Click}>
            NO
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container-fluid  bg-primery">
        <AddAccount AddedHandler={AddedHandler} AddingHandler={AddingHandler} />
        <div className="row">
          <div className="col justify-content-end d-flex mt-1">
            <button className="btn border-0 " onClick={BtnRefreh_Click}>
              <FontAwesomeIcon className="   text-success" icon={faRefresh} />
            </button>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <div
              style={{ height: 635, width: "100%", backgroundColor: "#eff1fa" }}
            >
              <DataGrid
                rows={accountList}
                columns={columns}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
