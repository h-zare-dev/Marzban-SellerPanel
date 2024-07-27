import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import SellerType from "@/models/SellerType";

interface PropsType {
  Loading: boolean;
  Sellers: SellerType[];
  onDeleting: (seller: SellerType) => void;
  onDisableAccount: (seller: SellerType) => void;
}

export default function SellerGrid(props: PropsType) {
  const columns = [
    {
      field: "Title",
      headerName: "Title",
      width: 150,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "Username",
      headerName: "Username",
      width: 150,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "Password",
      headerName: "Password",
      width: 150,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "MarzbanUsername",
      headerName: "MarzbanUsername",
      width: 200,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "MarzbanPassword",
      headerName: "MarzbanPassword",
      width: 200,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "Limit",
      headerName: "Limit(GB)",
      width: 100,
      headerClassName: "MUIGridHeader",
    },
    {
      headerName: "Status",
      field: "active",
      type: "actions",
      width: 100,
      headerClassName: "MUIGridHeader",
      getActions: (params: { row: SellerType }) => [
        <GridActionsCellItem
          key="active"
          label="Active"
          icon={
            params.row.Status == "Active" ? (
              <ToggleOnIcon
                sx={{ fontSize: "35px" }}
                className="text-success "
              />
            ) : (
              <ToggleOffIcon
                className="text-secondry "
                sx={{ fontSize: "35px" }}
              />
            )
          }
          onClick={() => onDisableAccount(params.row)}
        />,
        ,
      ],
    },
    {
      headerClassName: "MUIGridHeader",
      headerName: "",
      field: "delete",
      type: "actions",
      width: 50,
      getActions: (params: { row: SellerType }) => [
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={<DeleteIcon className="text-danger" />}
          onClick={() => onDeleteClick(params.row)}
        />,
      ],
    },
  ];

  const onDeleteClick = (seller: SellerType) => {
    props.onDeleting(seller);
  };

  const onDisableAccount = (seller: SellerType) => {
    props.onDisableAccount(seller);
  };

  return (
    <div className="container-fluid my-3 GridSellerContainer ">
      <div className="row d-flex justify-content-center  ">
        <div className="col-12">
          <DataGrid
            getRowId={(row) => row.Title}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10]}
            className="Grid"
            rows={props.Sellers}
            columns={columns}
            loading={props.Loading}
            sx={{
              boxShadow: 2,
              border: 2,
              borderColor: "purple",
              width: "100%",
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "lightgray",
                color: "purple",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiDataGrid-cell": {
                textAlign: "center",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
