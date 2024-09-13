import { useImperativeHandle, useState, forwardRef } from "react";
import { Button, Modal } from "react-bootstrap";
import QRCode from "react-qr-code";

interface PropsType {}

interface ForwardRefHandle {
  Show: (subscriptionUrl: string, username: string) => void;
  Hide: () => void;
}

const DeleteModal = forwardRef<ForwardRefHandle, PropsType>((props, ref) => {
  const [subscriptionUrl, setSubscriptionUrl] = useState("");
  const [username, setUsername] = useState("");

  useImperativeHandle(ref, () => ({
    Show: (subscriptionUrl: string, username: string) => {
      setSubscriptionUrl(subscriptionUrl);
      setUsername(username);
    },
    Hide: btnClose_Click,
  }));
  const btnClose_Click = () => {
    setSubscriptionUrl("");
  };
  return (
    <Modal
      className="border border-1 shadow rounded-3"
      show={subscriptionUrl !== ""}
      backdrop="static"
      keyboard={false}
      onHide={btnClose_Click}
    >
      <Modal.Header closeButton className=" text-white bg-success">
        <Modal.Title>
          QR Code <label className="text-warning">{username}</label>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 256,
            width: "100%",
          }}
        >
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={subscriptionUrl}
            viewBox={`0 0 256 256`}
            level="H"
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="dark" className="w100px" onClick={btnClose_Click}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

DeleteModal.displayName = "DeleteModal";

export default DeleteModal;
