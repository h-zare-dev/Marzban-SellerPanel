import { ElementRef, useRef, useState } from "react";

import TextField from "@mui/material/TextField";

import SellerType from "@/models/SellerType";
import Messages from "../General/Messages";

interface PropsType {
  onAdding: (seller: SellerType) => void;
}
export default function AddSeller(props: PropsType) {
  const txtTitle = useRef<HTMLInputElement | null>(null);
  const txtUsername = useRef<HTMLInputElement | null>(null);
  const txtPassword = useRef<HTMLInputElement | null>(null);
  const txtLimit = useRef<HTMLInputElement | null>(null);
  const txtMarzbanUsername = useRef<HTMLInputElement | null>(null);
  const txtMarzbanPassword = useRef<HTMLInputElement | null>(null);

  type MessagesHandle = ElementRef<typeof Messages>;
  const refMessages = useRef<MessagesHandle>(null);

  const BtnAdd_Click = () => {
    if (!txtTitle.current || !txtTitle.current.value) {
      refMessages.current?.Show("error", "Title Is Required!");
      return;
    }

    if (txtTitle.current.value.length < 8) {
      refMessages.current?.Show("error", "Title Greater Then 8 Charecters!");
      return;
    }

    if (
      !txtLimit.current ||
      !txtLimit.current.value ||
      txtLimit.current.value === ""
    ) {
      refMessages.current?.Show("error", "Limit Is Required!");
      return;
    }

    if (!txtUsername.current || !txtUsername.current.value) {
      refMessages.current?.Show("error", "Username Is Required!");
      return;
    }

    if (txtUsername.current.value.length < 8) {
      refMessages.current?.Show("error", "Username Greater Then 8 Charecters!");
      return;
    }

    if (!txtPassword.current || !txtPassword.current.value) {
      refMessages.current?.Show("error", "Password Is Required!");
      return;
    }

    if (txtPassword.current.value.length < 8) {
      refMessages.current?.Show("error", "Password Greater Then 8 Charecters!");
      return;
    }

    if (!txtMarzbanUsername.current || !txtMarzbanUsername.current.value) {
      refMessages.current?.Show("error", "Marzban Username Is Required!");
      return;
    }

    if (!txtMarzbanPassword.current || !txtMarzbanPassword.current.value) {
      refMessages.current?.Show("error", "Marzban Password Is Required!");
      return;
    }

    const title = txtTitle.current.value;
    const limit = +txtLimit.current.value;
    const username = txtUsername.current.value;
    const password = txtPassword.current.value;
    const marzbanUsername = txtMarzbanUsername.current.value;
    const marzbanPassword = txtMarzbanPassword.current.value;

    const seller: SellerType = {
      Title: title,
      Limit: limit,
      Username: username,
      Password: password,
      MarzbanUsername: marzbanUsername,
      MarzbanPassword: marzbanPassword,
    };
    props.onAdding(seller);
  };
  return (
    <>
      <Messages ref={refMessages}></Messages>
      <div className="container  moduleContainerStyle moduleContainer py-2  rounded  ">
        <div></div>
        <div className="row py-1 my-1">
          <div className="col-12 ">
            <TextField
              inputRef={txtTitle}
              fullWidth
              id="outlined-basic"
              required
              label="Title"
              variant="outlined"
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-12 ">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Limit(GB)"
              variant="outlined"
              type="number"
              inputRef={txtLimit}
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-12 py-1 ">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Username"
              variant="outlined"
              inputRef={txtUsername}
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-12 py-1">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Password"
              variant="outlined"
              inputRef={txtPassword}
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-12 py-1 ">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Marzban Username"
              variant="outlined"
              inputRef={txtMarzbanUsername}
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-12 py-1">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Marzban Password"
              variant="outlined"
              inputRef={txtMarzbanPassword}
            />
          </div>
        </div>

        <div className="row">
          <div
            className="col-12 d-flex mt-1 mx-1 justify-content-center"
            id="divButton"
          >
            <button
              onClick={BtnAdd_Click}
              className="btn btnAdd w100px BgGrdColorizePurple text-white border-1 BorderPurple  "
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
