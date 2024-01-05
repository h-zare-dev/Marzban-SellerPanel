import { ElementRef, useRef, useState } from "react";

import TextField from "@mui/material/TextField";
import Typography from "@mui/joy/Typography";
import Switch from "@mui/joy/Switch";

import TariffType from "@/models/TariffType";
import Messages from "../General/Messages";

interface PropsType {
  onAdding: (seller: TariffType) => void;
}

export default function AddTariff(props: PropsType) {
  const txtTitle = useRef<HTMLInputElement | null>(null);
  const txtDuration = useRef<HTMLInputElement | null>(null);
  const txtDataLimit = useRef<HTMLInputElement | null>(null);

  const [isFree, setIsFree] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
      !txtDataLimit.current ||
      !txtDataLimit.current.value ||
      txtDataLimit.current.value === ""
    ) {
      refMessages.current?.Show("error", "DataLimit Is Required!");
      return;
    }

    if (
      !txtDuration.current ||
      !txtDuration.current.value ||
      txtDuration.current.value === ""
    ) {
      refMessages.current?.Show("error", "Duration Is Required!");
      return;
    }

    const title = txtTitle.current.value;
    const datalimit = +txtDataLimit.current.value;
    const duration = +txtDuration.current.value;

    const tariff: TariffType = {
      Title: title,
      DataLimit: datalimit,
      Duration: duration,
      IsFree: isFree,
      IsVisible: isVisible,
    };
    props.onAdding(tariff);
  };

  return (
    <>
      <Messages ref={refMessages}></Messages>
      <div className="container  moduleContainerStyle moduleContainer py-2  rounded  ">
        <div className="row py-1 my-1">
          <div className="col-12 ">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Title"
              variant="outlined"
              inputRef={txtTitle}
            />
          </div>
        </div>
        <div className="row py-1 my-1">
          <div className="col-md-6 col-sm-12 py-1 ">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="Duration"
              variant="outlined"
              type="number"
              inputRef={txtDuration}
            />
          </div>
          <div className="col-md-6 col-sm-12 py-1">
            <TextField
              fullWidth
              id="outlined-basic"
              required
              label="DataLimit"
              variant="outlined"
              type="number"
              inputRef={txtDataLimit}
            />
          </div>
          <div className="col-md-6 col-sm-12"></div>
        </div>
        <div className="row py-3 my-1">
          <div className="col-md-6 col-sm-12 py-1">
            <Typography
              component="label"
              endDecorator={
                <Switch
                  sx={{ ml: 1 }}
                  defaultChecked
                  onChange={(e) => {
                    setIsVisible(e.target.checked);
                  }}
                />
              }
            >
              Active?
            </Typography>
          </div>
          <div className="col py-1">
            <Typography
              component="label"
              endDecorator={
                <Switch
                  sx={{ ml: 1 }}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                  }}
                />
              }
            >
              Is Free?
            </Typography>
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
