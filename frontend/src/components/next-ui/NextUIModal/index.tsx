import { ReactNode, useEffect } from "react";
import {
   Modal,
   ModalContent,
   ModalHeader,
   ModalBody,
   ModalFooter,
   useDisclosure,
   Divider,
} from "@heroui/react";

type NextUIModalSettings = {
   fullScreen: boolean;
};

type Size =
   | "sm"
   | "md"
   | "lg"
   | "xs"
   | "xl"
   | "2xl"
   | "3xl"
   | "4xl"
   | "5xl"
   | "full"
   | undefined;

type Props = {
   open: boolean;
   onClose: () => void;
   title: string;
   subtitle?: string | null;
   children: ReactNode;
   footer?: ReactNode;
   size?: Size;
   isDismissable?: boolean;
   isKeyboardDismissDisabled?: boolean;
   settings?: NextUIModalSettings;
};

const NextUIModal = ({
   open,
   onClose: handleClose,
   title,
   subtitle,
   children,
   footer,
   size = "lg",
   isDismissable = false,
   isKeyboardDismissDisabled = false,
}: Props) => {
   const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

   useEffect(() => {
      if (open) {
         onOpen();
      } else {
         onClose();
      }
   }, [open, onOpen, onClose]);

   return (
      <Modal
         backdrop="blur"
         isOpen={isOpen}
         onOpenChange={() => {
            onOpenChange();
            handleClose();
         }}
         motionProps={{
            variants: {
               enter: {
                  y: 0,
                  opacity: 1,
                  transition: {
                     duration: 0.3,
                     ease: "easeOut",
                  },
               },
               exit: {
                  y: -20,
                  opacity: 0,
                  transition: {
                     duration: 0.2,
                     ease: "easeIn",
                  },
               },
            },
         }}
         size={size}
         classNames={{
            closeButton:
               "text-xl hover:text-orange-600 hover:bg-orange-300 mt-2 mr-2 transition-all duration-300 ease-in-out text-white",
         }}
         isDismissable={isDismissable}
         isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      >
         <ModalContent>
            {() => (
               <>
                  <ModalHeader className="flex flex-col px-6 py-4 bg-indigo-950 text-white">
                     <h2 className="text-xl font-semibold mb-1">{title}</h2>
                     {subtitle && (
                        <p className="text-sm text-white">{subtitle}</p>
                     )}
                  </ModalHeader>

                  <Divider />
                  <ModalBody className="p-4 max-h-[80vh] overflow-y-auto">
                     {children}
                  </ModalBody>
                  {footer && <ModalFooter>{footer}</ModalFooter>}
               </>
            )}
         </ModalContent>
      </Modal>
   );
};

export default NextUIModal;
