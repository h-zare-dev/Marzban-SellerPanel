import { useImperativeHandle, useState, forwardRef } from "react";
import { Button, Modal } from "react-bootstrap";

interface PropsType {
  DeletingHandler: () => void;
}

interface ForwardRefHandle {
  Show: (username: string) => void;
  Hide: () => void;
}

const DeleteModal = forwardRef<ForwardRefHandle, PropsType>((props, ref) => {
  const [username, setUsername] = useState("");

  useImperativeHandle(ref, () => ({
    Show: (username: string) => {
      setUsername(username);
    },
    Hide: () => setUsername(""),
  }));

  const btnNo_Click = () => {
    setUsername("");
  };

  const btnYes_Click = async () => {
    props.DeletingHandler();
    btnNo_Click();
  };

  console.log("DeleteModal Rendering!");

  return (
    <Modal
      className="border border-1 shadow rounded-3"
      show={username !== ""}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="bg-danger text-white ">
        <Modal.Title>
          Delete Account <label className="text-dark">{username}</label>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure to delete account?</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-end">
        <Button variant="danger" className="w100px" onClick={btnYes_Click}>
          YES
        </Button>
        <Button variant="dark" className="w100px" onClick={btnNo_Click}>
          NO
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

DeleteModal.displayName = "DeleteModal";

export default DeleteModal;
