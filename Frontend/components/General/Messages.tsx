import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import Zoom from "@mui/material/Zoom";
import Snackbar from "@mui/material/Snackbar";
import { AlertColor } from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";

interface PropsType {}
interface ForwardRefHandle {
  Show: (severity: AlertColor, text: string) => void;
  Hide: () => void;
}

interface MessageType {
  Open?: boolean;
  Severity?: AlertColor;
  Text?: string;
}

const Messages = forwardRef<ForwardRefHandle, PropsType>((props, ref) => {
  const [message, setMessage] = useState<MessageType>({
    Open: false,
    Severity: "error",
    Text: "",
  });

  useImperativeHandle(ref, () => ({
    Show: (severity: AlertColor, text: string) => {
      setMessage({ Severity: severity, Text: text, Open: true });
    },
    Hide: () => setMessage({ ...message, Open: false }),
  }));

  return (
    <Zoom in={message.Open} style={{ transitionDelay: "500ms" }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={message.Open}
        onClose={() => {
          setMessage({ ...message, Open: false });
        }}
      >
        <Alert
          variant="filled"
          severity={message.Severity}
          // icon={<CheckIcon fontSize="inherit" />}
        >
          {/* <AlertTitle>Warning</AlertTitle> */}
          {message.Text}
        </Alert>
      </Snackbar>
    </Zoom>
  );
});
Messages.displayName = "Messages";

export default Messages;
