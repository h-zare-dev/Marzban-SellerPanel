import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import TariffType from "@/models/TariffType";

interface PropsType {
  Loading: boolean;
  Tariffs: TariffType[];
  onDisableAccount: (tariff: TariffType) => void;
  onFreeChanged: (tariff: TariffType) => void;
}

export default function TariffGrid(props: PropsType) {
  const columns = [
    {
      field: "Title",
      headerName: "Title",
      width: 300,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "Duration",
      headerName: "Duration(Days)",
      width: 140,
      headerClassName: "MUIGridHeader",
    },
    {
      field: "DataLimit",
      headerName: "DataLimit(GB)",
      width: 140,
      headerClassName: "MUIGridHeader",
    },
    {
      headerName: "Free",
      field: "free",
      type: "actions",
      width: 100,
      headerClassName: "MUIGridHeader",
      getActions: (params: { row: TariffType }) => [
        <GridActionsCellItem
          key="free"
          label="Free"
          icon={
            params.row.IsFree ? (
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
          onClick={() => onFreeEnable(params.row)}
        />,
        ,
      ],
    },
    {
      headerName: "Active",
      field: "active",
      type: "actions",
      width: 100,
      headerClassName: "MUIGridHeader",
      getActions: (params: { row: TariffType }) => [
        <GridActionsCellItem
          key="active"
          label="Active"
          icon={
            params.row.IsVisible ? (
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
  ];

  const onDisableAccount = (tariff: TariffType) => {
    props.onDisableAccount(tariff);
  };

  const onFreeEnable = (tariff: TariffType) => {
    props.onFreeChanged(tariff);
  };

  return (
    <div className="container-fluid GridTariffContainer  my-3  ">
      <DataGrid
        getRowId={(row) => row.Title}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10]}
        className="Grid"
        rows={props.Tariffs}
        columns={columns}
        loading={props.Loading}
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: "purple",
          width: "400",
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
  );
}
