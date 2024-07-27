"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

import { useMyContext } from "@/context/MyContext";
import AccountManagment from "@/components/Accounts/AccountManagement";
import TariffManagement from "@/components/Tariffs/TariffManagement";
import SellerManagement from "@/components/Sellers/SellerManagement";

export default function Dashboard() {
  const [activeComponent, setActiveComponent] = useState<string>("accounts"); //packages-agents
  const [activeComponentName, setActiveComponentName] = useState<string>(
    "My Accounts Management"
  ); //packages-agents

  const router = useRouter();
  const { user, setUser } = useMyContext();

  useEffect(() => {
    if (user.Token === "") router.push("/seller");
  }, [user.Token, router]);

  const BtnExit_Click = () => {
    setUser({ Token: "", IsAdmin: false, Username: "", Limit: 0 });
    router.push("/seller");
  };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  };
  const handlePackagesClick = (e: any) => {
    setActiveComponent("packages");
    setActiveComponentName("My Packages Management");
  };
  const handleAgentsClick = (e: any) => {
    setActiveComponent("agents");
    setActiveComponentName("My Agents Management");
  };
  const handleAccountsClick = (e: any) => {
    setActiveComponent("accounts");
    setActiveComponentName("My Accounts Management");
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="container-fluid ">
      <div className="row BgGrdColorizePurple justify-content-end d-flex">
        <div className="col-10 container d-inline-flex align-items-start py-1 ">
          <div className="row">
            <div className="col-12">
              <h6 className="text-white mx-3 py-1 ">Welcome {user.Username}</h6>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <h6 className="text-white d-flex py-1">
                DataLimit:
                <label className="text-warning mx-1">
                  {user.Limit} <label className="text-white">GB</label>
                </label>
              </h6>
            </div>
          </div>
        </div>
        <div className="col-2  d-flex  justify-content-end justify-content-xm-center py-1">
          <button className="btn border-0" onClick={BtnExit_Click}>
            <PowerSettingsNewIcon className="text-white" />
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {user.IsAdmin && (
            <React.Fragment>
              <div className="row ActiveComponentNameRow">
                <div className="col-12 d-inline-flex">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="Fair Internet Dashboard">
                      <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{
                          ml: 1,
                          color: "gray",
                        }}
                        aria-controls={open ? "account-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                      >
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: "warning.light",
                            border: "solid 2px warning.dark",
                          }}
                        >
                          DB
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={handleAccountsClick}>
                      My Accounts
                    </MenuItem>
                    <MenuItem onClick={handlePackagesClick}>
                      My Packages
                    </MenuItem>
                    <MenuItem onClick={handleAgentsClick}>My Agents</MenuItem>
                  </Menu>
                  <div className="w-25"></div>
                  <div className="ActiveComponentName w-75">
                    {activeComponentName}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          {activeComponent == "accounts" && (
            <AccountManagment></AccountManagment>
          )}
          {activeComponent == "packages" && (
            <TariffManagement></TariffManagement>
          )}
          {activeComponent == "agents" && <SellerManagement></SellerManagement>}
        </div>
        <div className="d-flex justify-content-center">
          Marzban Seller Panel v1.9.4
        </div>
      </div>
    </div>
  );
}
