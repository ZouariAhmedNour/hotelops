import { useState } from "react";

export const useDisclosure = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((value) => !value);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};