/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useState } from "react";
import { Button, Modal, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";

interface ModalWithMessageInterface {
  title: string;
  message: string;
}

export const ModalWithMessage = ({title, message}: ModalWithMessageInterface) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={title}
        onClose={onClose}
      >
        <ModalContent>
          {message}
        </ModalContent>
        <ModalButtonBar>
          <Button styleType='high-visibility' onClick={onClose}>
            Close
          </Button>
        </ModalButtonBar>
      </Modal>
    </>
  );
};

