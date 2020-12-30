import React from "react";

// hooks and services
import { useStoreActions } from "../../store/globalStore";

// components, styles and UI
import { Dropdown } from "semantic-ui-react";

// interfaces
export interface TokenDropdownProps {}

const TokenDropdown: React.FunctionComponent<TokenDropdownProps> = () => {
  const setCurrentToken = useStoreActions(
    (actions) => actions.setSelectedToken
  );

  const countryOptions = [
    {
      key: "dai",
      value: "dai",
      text: "DAI",
      image: { avatar: true, src: require("../../assets/dai.jpg") },
    },
    {
      key: "usdc",
      value: "usdc",
      text: "USDC",
      image: { avatar: true, src: require("../../assets/usdc.svg") },
    },
  ];

  const handleChange = (e, data) => {
    setCurrentToken(data.value);
  };
  // TODO: set default value to "DAI"
  return (
    <Dropdown
      selectOnBlur
      placeholder="Token"
      className="token"
      defaultValue="dai"
      compact
      selection
      options={countryOptions}
      onChange={handleChange}
    />
  );
};

export default TokenDropdown;
